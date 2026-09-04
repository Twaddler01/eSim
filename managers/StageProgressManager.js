import { getItemMax } from '../utils/stageHelpers.js';

export default class StageProgressManager {

    constructor(gameData, stageData, stageItems, stageObjectives, stageProgressState) {

        this.gameData = gameData;
        this.stageData = stageData;
        this.stageItems = stageItems;
        this.objectives = stageObjectives;

        // Sync with save
        this.state = stageProgressState;

        // Player's current stage
        this.stage =
            gameData.currentStage.stage;

        // Current quantities
        this.values =
            this.state.data.amounts ??= {};

        // Gather upgrade levels
        this.gatherLevels =
            this.state.data.gatherLevels ??= {};
        
        this.autoGatherLevels =
            this.state.data.autoGatherLevels ??= {};

        this.unlocked =
            this.state.data.unlocked ??= {};

        // Observable changes
        this.events =
            new Phaser.Events.EventEmitter();
    }

    // data: card item (output)
    getReqData(data, requirements) {
        
        // NOTE: this.getUnlocked(upgrade.item) needs custom requirements for other tabs
        // ONLY for ui updates
        let isUnlocked, getCreateUpgradesStatus;

        if (data.tab === 'create') {
            // UI only
            isUnlocked = this.getCreateAvailability(data, data.tab) !== 'locked';
            // Actual card unlock status
            getCreateUpgradesStatus = this.getCreateUpgradesStatus(data);
        } else {
            isUnlocked = this.getUnlocked(data.item);
        }

        if (!requirements) {
            return {
                id: data.id,
                noReq: true,
                requirements: {},
                allMet: true,
                buttonTextColor: isUnlocked ? '#ffffff' : '#777777',
                buttonFill: isUnlocked ? 0x335533 : 0x222222,
                buttonStroke: isUnlocked ? 0x66aa66 : 0x555555,
                upgradeStatus: getCreateUpgradesStatus
            };
        }

        const producesItems = [];
        // Get produce data
        if (data.produces) {
            Object.entries(data.produces).forEach(([pro, val]) => {
                const title = this.getItemTitle(pro) ?? pro;
                producesItems.push({
                    id: pro,
                    title: title,
                    producesCnt: val
                });
            });
        }

        const allData = [];
        requirements.forEach(item => {
            const amt = this.get(item.id);
            allData.push({
                ...item,
                cnt: amt,
                output: item.title + ' ' + amt + ' / ' + item.amt,
                met: amt >= item.amt,
                color: amt >= item.amt ? '#66ff66' : '#ff6666',
            });
        });
        
        const allMet = allData.every(item => item.met) && isUnlocked;
        
        return {
            id: data.id,
            requirements: allData,
            allMet: allMet,
            buttonTextColor: allMet ? '#ffffff' : '#777777',
            buttonFill: allMet ? 0x335533 : 0x222222,
            buttonStroke: allMet ? 0x66aa66 : 0x555555,
            upgradeStatus: getCreateUpgradesStatus,
            produces: producesItems ?? null
        };
    }

    // Lock state
    getLockState(item) {
        const unlocked = item.startsUnlocked || this.getUnlocked(item.id);
        
        if (unlocked) {
            return 'unlocked';
        }
        
        return 'locked';
    }

// WIP new? 
getCardState(item) {
    
    let tab = item.tab;
    const subTab = item.subTab;
    
    if (subTab === 'upgrades') {
        tab = 'create-upgrades';
    }
    
    let state = 'locked'
    switch (tab) {
        case 'gather':
            let gatherState = this.getGatherAvailability(item);
            
            return {
                gather: gatherState,
                upgrade: null
            };
            break;
        case 'create':
            
            break;
        case 'create-items':
            
            break;
        case 'discover':
            
            break;
    }
    
}

    // Availability (gather) / for getCardCanAction() ('active' = true)
    getGatherAvailability(item) {
        let state = 'locked';
        
        const unlocked =
            item.startsUnlocked ||
            this.getUnlocked(item.id);

        if (unlocked) {
            state = 'active';
        }

        const amount =
            this.get(item.id);
    
        const max =
            getItemMax(item, this);
    
        if (
            max != null &&
            amount >= max
        ) {
            state = 'maxed';
        }
        
        return state;
    }

    // Availability (create) / for getCardCanAction() ('active' = true)
    getCreateAvailability(item) {
        // CreateUpgrades
        if (item.subTab === 'upgrades') {

            // TEST_UNLOCK: requires only unlock --  OVERLAY ONLY 
            const isActive = this.getUnlocked(item.id);
            //const isActive = this.isCreateUpgradesActive(item.item);
            
            if (isActive) {
                return 'active';
            } else {
                return 'locked';
            }
        }

        //// new TEST_UNLOCK: requires only unlock
        if (this.getUnlocked(item.id)) {
            return 'active';
        }
        ////

        // CREATE -> ITEMS
        if (!this.isCreateItemUnlocked(item)) {
            return 'locked';
        }

        const requirementsMet =
            Object.entries(item.requirements ?? {})
                .every(([id, required]) => {
                    return this.get(id) >= required;
                });

        if (!requirementsMet) {
            return 'unlocked';
        }

        return 'active';
    }

    // Availability (create -> upgrades)
    getCreateUpgradesStatus(item) {
        if (!item) return;
        
        // Get status of item affected by upgrade (unlocked = active)
        // TEST_UNLOCK: requires only unlock
        const isActive = this.getUnlocked(item.id);
        //const isActive = this.isCreateUpgradesActive(item.item);

        if (isActive) {
            const level = this.autoGatherLevels[item.item];

            if (level > 0) {
                // Auto gather UI status 
                return 'enabled';
            }
            return 'active';
        }
        
        return 'locked';
    }
    
    // helper ^
    isCreateUpgradesActive(id) {
        return this.getUnlocked(id);
    }

//--------------------------------
//ggg getCurrentTabCardData => item functions for GATHER/CREATE
//--------------------------------

    // AUTO GATHER
    syncAutoGather() {
        this.autoGather.clear();
    
        for (const item of this.getGatherItems()) {
    
            const autoAmt =
                this.getAutoGatherAmount(
                    item.id
                );
    
            if (autoAmt <= 0) {
                continue;
            }
    
            this.autoGather.setActive(
                item.id,
                autoAmt
            );
        }
    }
    
    handleAutoGather(itemId, autoAmt) {
        const item =
            this.getGatherItems()
                .find(item => item.id === itemId);
        if (!item) {
            return;
        }
        this.gather(item, autoAmt);
    }
    
    upgradeAutoGather(itemId, requirements) {
        
        // Deduct costs
        if (requirements) {
            requirements.forEach(req => {
                this.remove(
                    req.id,
                    req.amt
                );
            });
        }
        
        // Set level
        const current =
            this.getAutoGatherAmount(itemId);
    
        const newLevel =
            current + 1;
    
        this.setAutoGatherLevel(
            itemId,
            newLevel
        );
        
        return newLevel;
    }

    getAutoGatherAmount(itemId) {
        const level =
            this.autoGatherLevels[itemId] ?? 0;
        return level;
    }

    setAutoGatherLevel(id, level) {
        const newLevel =
            Math.max(0, level);
    
        this.autoGatherLevels[id] =
            newLevel;
    
        this.sync();
    
        this.events.emit(
            'updated',
            {
                type: 'gather-auto-upgrade',
                id,
                level: newLevel
            }
        );
    
        return newLevel;
    }

    gather(item, autoAmt = 0) {
        const current =
            this.get(item.id);
    
        const upgradeStats =
            this.getGatherUpgradeStats(
                item.id,
                item
            );
    
        const max =
            upgradeStats.current_max;
    
        const gatherAmount =
            autoAmt > 0
                ? autoAmt
                : this.getGatherAmount(item);
    
        const newAmount =
            max == null
                ? current + gatherAmount
                : Math.min(
                    current + gatherAmount,
                    max
                );
    
        this.set(
            item.id,
            newAmount
        );
    
        this.gatherUpgradeAvailable(item);
    }
    
    //ccc Create
    create(item) {
        const requirements =
            item.requirements ?? {};

        const canCreate =
            Object.entries(requirements)
                .every(([id, required]) => {

                    const amount =
                        this.get(id);

                    return amount >= required;
                });

        if (!canCreate) {
            return;
        }

        // Consume
        Object.entries(requirements)
            .forEach(([id, amount]) => {

                this.add(
                    id,
                    -amount
                );
            });

        // Produce
        Object.entries(item.produces ?? {})
            .forEach(([id, amount]) => {

                // If produced item triggers requirements
                if (!this.getUnlocked(id)) {
                    this.unlock(id);
                }

                this.add(
                    id,
                    amount
                );
            });
    }

    getCardCanAction(item) {
        if (item.tab === 'gather') {
            return this.getGatherAvailability(item) === 'active';
        }
        if (item.tab === 'create') {
            return this.getCreateAvailability(item) === 'active';
        }
    }
    
    handleCardAction(item, tab) {
        // Gather
        if (tab === 'gather') {
            this.gather(item);
        }
    
        // Create
        if (tab === 'create') {
            this.create(item);
            return;
        }
    }

    getGatherUpgradeStats(id, item) {
        const upgrade =
            item.gather?.upgrade;
    
        const rateIncrease =
            upgrade?.rateIncrease ?? 0;
    
        const maxIncrease =
            upgrade?.maxIncrease ?? 0;
    
        const level =
            this.getGatherLevel(id);
    
        const baseMax =
            item.max ?? null;
    
        const currentMax =
            baseMax == null
                ? null
                : baseMax + level * maxIncrease;
    
        const currentGatherRate =
            1 + level * rateIncrease;
    
        const hasRateUpgrade =
            rateIncrease > 0;
    
        const hasMaxUpgrade =
            maxIncrease > 0;
    
        const hasUpgrade =
            this.hasGatherUpgrade(item);
    
        const cost =
            currentMax != null
                ? Math.ceil(currentMax * 0.9)
                : null;
    
        return {
            id,
            level,
    
            hasUpgrade,
            hasRateUpgrade,
            hasMaxUpgrade,
    
            base_max: baseMax,
            current_max: currentMax,
    
            rateIncrease,
            maxIncrease,
    
            currentGatherRate,
    
            cost
        };
    }

    gatherUpgradeAvailable(item) {
        if (!this.hasGatherUpgrade(item)) {
            return false;
        }
    
        const stats =
            this.getGatherUpgradeStats(
                item.id,
                item
            );
    
        const current =
            this.get(item.id);

        // If there is a rate upgrade, make sure
        // another rate level would still be useful.
        const rateIsUseful =
            !stats.hasRateUpgrade ||
            stats.currentGatherRate < stats.current_max;
    
        // If this is max-only, this remains true.
        // If this is rate-only, it prevents useless
        // rate upgrades after reaching the max.
        if (!rateIsUseful) {
            return false;
        }

        return current >= stats.cost;
    }

    upgradeGather(item) {
        if (!this.gatherUpgradeAvailable(item)) {
            return false;
        }
    
        const stats =
            this.getGatherUpgradeStats(item.id, item);
    
        // Pay the cost
        this.add(
            item.id,
            -stats.cost
        );
    
        // Increase level
        this.addGatherLevel(
            item.id,
            1
        );
    
        return true;
    }

//--------------------------------
//ggg OTHER GATHER FUNCTIONS
//--------------------------------

    getGatherItems() {
        return this.stageItems.filter(item => item.tab === 'gather');
    }

    hasGatherUpgrade(item) {
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade) {
            return false;
        }
    
        // Explicitly disabled
        if (upgrade.enabled === false) {
            return false;
        }
    
        const hasRate =
            (upgrade.rateIncrease ?? 0) > 0;
    
        const hasMax =
            (upgrade.maxIncrease ?? 0) > 0;
    
        // enabled:true OR legacy/missing enabled
        // with an actual upgrade value.
        return (
            upgrade.enabled === true ||
            hasRate ||
            hasMax
        );
    }

    getGatherAmount(item) {
        const baseAmount = 1;
    
        const upgrade =
            item.gather?.upgrade;
    
        if (
            !upgrade ||
            upgrade.enabled === false ||
            (upgrade.rateIncrease ?? 0) <= 0
        ) {
            return baseAmount;
        }
    
        const level =
            this.getGatherLevel(item.id);
    
        return (
            baseAmount +
            level * upgrade.rateIncrease
        );
    }

    // Gather upgrade levels
    getGatherLevel(id) {
        return this.gatherLevels[id] ?? 0;
    }

    setGatherLevel(id, level) {
        const newLevel =
            Math.max(0, level);

        this.gatherLevels[id] =
            newLevel;

        this.sync();

        this.events.emit(
        'updated',
        {
            type: 'gather-upgrade',
            id,
            level: newLevel
        }
    );

        return newLevel;
    }

    addGatherLevel(id, amount = 1) {
        return this.setGatherLevel(
            id,
            this.getGatherLevel(id) + amount
        );
    }

//--------------------------------
//ccc functions for CREATE
//--------------------------------

    isCreateItemUnlocked(item) {
        const requirements = item.requirements ?? {};
    
        // No requirements = unlocked
        if (Object.keys(requirements).length === 0) {
            return true;
        }
        
        // Every required item must be unlocked
        return Object.keys(requirements).every(
            id => this.getUnlocked(id)
        );
    }

    getCreateItems() {
        return this.stageItems.filter(item => item.tab === 'create');
    }

    getAllItems() {
        return this.stageItems;
    }

    getAllCardIds() {
        // Gather and Create tab
        const stageGather_Create = this.stageItems;
        
        // Create -> Upgrades tab
        const stageCreateUpgrades = [];
        // See fn.getCreateUpgradesCardData
        const gatherItems = this.getGatherItems();
        gatherItems.forEach(item => {
            stageCreateUpgrades.push({
                id: item.id + '_gather_upgrade',
                title: item.title + ' UPGRADES',
                tab: 'create',
                subTab: 'upgrades' ?? null
            });
        });

        // Discover tab
        const stageDiscover = this.objectives;

        const returnData = [
            ...stageGather_Create,
            ...stageCreateUpgrades,
            ...stageDiscover
        ];
        
        return returnData;
    }

    // --------------------------------------------------
    // GETTERS AND SETTERS
    // --------------------------------------------------

    getAllValues() {
        return { ...this.values };
    }

    // Get amount
    get(id) {
        return this.values[id] ?? 0;
    }

    // Set amount
    set(id, amount) {
        const newAmount =
            Math.max(0, amount);

        this.values[id] =
            newAmount;

        this.sync();

        // StageDiscoveryTracker
        this.events.emit(
            'updated',
            {
                type: 'item-amount',
                id,
                amount: newAmount
            }
        );

        return newAmount;
    }

    // Add amount
    add(id, amount) {
        return this.set(
            id,
            this.get(id) + amount
        );
    }

    // Remove amount
    remove(id, amount = 1) {
        if (this.get(id) < amount) {
            console.warn('Negative deduction detected, stageProgress.remove() cancelled. Item: ' + id + ' Amount: ' + amount);
            return;
        }
        return this.set(
            id,
            this.get(id) - amount
        );
    }

    getItem(id) {
        return this.stageItems.find(
            item => item.id === id
        ) ?? null;
    }
    
    getItemTitle(id) {
        const item = this.stageItems.find(i => i.id === id);
        if (item) return item.title ?? item.id;
        return null;
    }

    // UNLOCK
    getAllUnlocked() {
        return this.unlocked;
    }
    
    getUnlocked(id) {
        return this.unlocked[id] === true;
    }
    
    unlock(id, type) {
        if (this.unlocked[id]) {
            return;
        }
        this.unlocked[id] = true;
        this.sync();
        
        // StageDiscoveryTracker
        this.events.emit('updated', {
            id,
            type: 'item-unlock'
        });
    }
    
    lock(id, type) {
        delete this.unlocked[id];
        this.sync();
        
        // StageDiscoveryTracker
        this.events.emit('updated', {
            id,
            type: 'item-unlock'
        });
    }

    getTabId(id) {
        const createItem = this.stageItems.find(s => s.id === id && s.tab === 'create');
        if (createItem) {
            return 'create';
        }
        const discoverItem = this.objectives.find(o => o.id === id && o.tab === 'discover');
        if (discoverItem) {
            return 'discover';
        }
        return 'gather';
    }

//--------------------------------
// Sync to gameData for saving
//--------------------------------

    sync() {
        this.state.sync();
    }

//--------------------------------
// Events
//--------------------------------

    on(event, handler) {
        this.events.on(event, handler);
    }

    off(event, handler) {
        this.events.off(event, handler);
    }

//--------------------------------
// STAGE FUNCTIONS
//--------------------------------

    // For current stage
    getCurrentStage() {
        return this.stage;
    }

    // For objective lookups
    getCurrentStageId() {
        const stage = this.stageData.find(s => s.stage === this.gameData.currentStage.stage);
        if (!stage) return 'creation';
        return stage.id;
    }

    setStage(id) {
        const stage = this.stageData.find(s => s.id === id);
        if (!stage) {
            console.warn('setStage() - Stage not found.');
            return;
        }
        this.gameData.currentStage.stage = stage.stage;
        return stage.title;
    }

    // or StageUI ??
    getNextStage() {
// WIP Cleanup saveData here...
        gameData.currentStage.stage += 1;
        const nextStage = this.stageData.find(s => s.stage === gameData.currentStage.stage);
        this.scene.start(nextStage.scene);
    }

//--------------------------------
// Destroy
//--------------------------------

    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }
}