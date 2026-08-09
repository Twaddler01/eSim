import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { stageData, stageItems } from '../../data/stageData.js';
import { gameData } from '../../data/gameData.js';
import MessageStatus from './MessageStatus.js';
import StageProgressManager from '../../managers/StageProgressManager.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';

export default class StageUI {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.width =
            options.width ??
            scene.scale.width;

        this.height =
            options.height ??
            scene.scale.height;

        this.headerHeight = 280;
        this.headerTitleHeight = 40;
        
        this.headerBoxX = 10;
        this.headerBoxY = 10;
        this.belowHeaderY = 50;
        this.headerBoxWidth = this.width / 3 - 8;
        this.headerBoxHeight = this.headerHeight - this.headerTitleHeight;

        this.createUI();
    }

    // Create UI
    createUI() {
        this.stageProgress =
            new StageProgressManager(gameData);

        // Current stage
        this.stage = stageData[0];

        // Listen for changes
        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                update => {
                    this.updateAffectedCards(update.id);
                }
            );
        
        // For UI tab chsnges
        this.removeTabListener =
            listenToEvent(
                this.scene.events,
                'stage-tab-changed',
                id => {
                    this.changeTab(id);
                }
            );

        // Header
        this.createHeader();

        // Inventory
        this.inventory =
            new StageInventory(
                this.scene,
                this.stageProgress,
                stageItems,
                {
                    x: this.headerBoxX + this.headerBoxWidth + 1,
                    y: this.belowHeaderY + 1,
                    width: this.headerBoxWidth,
                    height: this.headerHeight - this.headerTitleHeight - 1,
                }
            );

        //this.headerBox3();

        // Messages
        this.messageStatus =
            new MessageStatus(
                this.scene,
                this.scene.gameTimer,
                {
                    x: this.headerBoxX,
                    y: this.belowHeaderY,
                    width: this.headerBoxWidth,
                    height: this.headerHeight - this.headerTitleHeight + 1,
                    fontSize: '18px',
                    fontColor: '#33FFE4'
                }
            );

        this.messageStatus.addMessageDelayed(
            'Welcome to eSim: Cell Stage!',
            2000
        );

        // Viewport
        const margin = 10;
        const navigationHeight = 60;
        const navigationY =
            this.height -
            navigationHeight -
            margin;
        const viewportY = 300;
        const viewportBottom =
            navigationY - 10;
        const viewportHeight =
            viewportBottom - viewportY;

        this.viewport =
            new StageViewport(
                this.scene,
                {
                    x: margin,
                    y: viewportY,
                    width:
                        this.width -
                        margin * 2,
                    height:
                        viewportHeight
                }
            );

        // Navigation
        this.navigation =
            new StageNavigation(
                this.scene,
                {
                    x: margin,
                    y: navigationY,
                    width:
                        this.width -
                        margin * 2,
                    height:
                        navigationHeight
                }
            );

        // DISCOVERY TRACKER
        this.discoveryTracker =
            new StageDiscoveryTracker(this.scene, this.stageProgress, stageItems, {
                    x: 10 + this.headerBoxWidth + 1 + this.width / 3 - 8 + 1,
                    y: 10 + this.headerTitleHeight + 1,
                    width: this.width / 3 - 7,
                    height: this.headerHeight - this.headerTitleHeight - 1
                }
            );

        // Initial tab
        this.currentTab = 'gather';
        this.refreshCurrentTab();
    }

    // Header
    createHeader() {
        this.scene.add.rectangle(
            this.headerBoxX,
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        addText(this.scene,
            20,
            10,
            '== CREATION STAGE ==',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
        
        this.scene.add.rectangle(
            this.headerBoxX + this.headerBoxWidth + 1,
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        this.scene.add.text(
            this.headerBoxX + this.headerBoxWidth + 80,
            this.headerTitleHeight / 2 - 2,
            'INVENTORY',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        
        this.scene.add.rectangle(
            this.headerBoxX + ((this.headerBoxWidth + 1)*2),
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        this.scene.add.text(
            this.headerBoxX + (this.headerBoxWidth + 1) * 2 + 40,
            this.headerTitleHeight / 2 - 2,
            'DISCOVERY TRACKER',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        );
    }

    // DISCOVERY AREA
    headerBox3() {
        this.headerBox3 =
            this.scene.add.rectangle(
                10 +
                    this.headerBoxWidth +
                    1 +
                    this.width / 3 - 8 +
                    1,
                10 + this.headerTitleHeight + 1,
                this.width / 3 - 7,
                this.headerHeight - this.headerTitleHeight - 1,
                0x444444
            )
            .setOrigin(0);
    }

    // Change tab
    changeTab(id) {

        if (this.currentTab === id) {
            return;
        }

        this.currentTab = id;

        // Changing tabs DOES rebuild the cards.
        this.refreshCurrentTab();
    }

gather(item) {
    const current =
        this.stageProgress.get(item.id);

    const max =
        getItemMax(item, this.stageProgress);

    // Inventory is full.
    // Don't add anything, but still allow upgrade logic.
    if (current >= max) {
        this.checkGatherUpgrade(item);
        return;
    }

    const gatherAmount =
        this.getGatherAmount(item);

    const newAmount =
        Math.min(
            current + gatherAmount,
            max
        );

    this.stageProgress.set(
        item.id,
        newAmount
    );

    // Check whether this gather filled the inventory.
    this.checkGatherUpgrade(item);
}

/*
    // Gather
    gather(item) {
        const current =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (current >= max) {
            return;
        }
    
        const gatherAmount =
            this.getGatherAmount(item);

        const newAmount =
            Math.min(
                current + gatherAmount,
                max
            );
    
        this.stageProgress.set(
            item.id,
            newAmount
        );
    
        this.checkGatherUpgrade(item);
    }
*/
    getGatherLevel(item) {
        return this.stageProgress.getGatherLevel(item.id);
    }
    
    getGatherAmount(item) {
        const baseAmount = 1;
    
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade?.enabled || !upgrade.rateIncrease) {
            return baseAmount;
        }
    
        const level =
            this.getGatherLevel(item);

        return (
            baseAmount +
            level * upgrade.rateIncrease
        );
    }

checkGatherUpgrade(item) {
    const upgrade =
        item.gather?.upgrade;

    if (!upgrade?.enabled) {
        return;
    }

    const current =
        this.stageProgress.get(item.id);

    const max =
        getItemMax(item, this.stageProgress);

    if (current < max) {
        return;
    }

    const rateIncrease =
        upgrade.rateIncrease ?? 0;

    const level =
        this.getGatherLevel(item);

    const currentGatherRate =
        1 +
        level * rateIncrease;

    // Rate has reached the maximum useful amount.
    // Do NOT purchase another rate upgrade.
    if (
        rateIncrease > 0 &&
        currentGatherRate >= max
    ) {
        return;
    }

    // Reset amount
    this.stageProgress.set(
        item.id,
        0
    );

    // Increase upgrade level
    this.stageProgress.addGatherLevel(
        item.id,
        1
    );
}

/*
    checkGatherUpgrade(item) {
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade?.enabled) {
            return;
        }
    
        const current =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (current < max) {
            return;
        }
    
        // Reset amount
        this.stageProgress.set(
            item.id,
            0
        );
    
        // Increase upgrade level
        this.stageProgress.addGatherLevel(
            item.id,
            1
        );
    }
*/
    getUpgrades(item) {
        return this.stageProgress.getGatherUpgradeStats(
            item.id,
            item
        );
    }

    // Create
    create(item) {
        const requirements =
            item.requirements ?? {};

        const canCreate =
            Object.entries(requirements)
                .every(([id, required]) => {

                    const amount =
                        this.stageProgress.get(id);

                    return amount >= required;
                });


        if (!canCreate) {
            return;
        }


        // Consume
        Object.entries(requirements)
            .forEach(([id, amount]) => {

                this.stageProgress.add(
                    id,
                    -amount
                );
            });


        // Produce
        Object.entries(item.produces ?? {})
            .forEach(([id, amount]) => {

                this.stageProgress.add(
                    id,
                    amount
                );
            });
    }

    // Availability
    getAvailability(item) {
        // Discoveries
        if (item.discovery) {
            return this.getDiscoveryStatus(item);
        }

        const unlocked =
            item.startsUnlocked ||
            this.stageProgress.getUnlocked(item.id);
        
        if (!unlocked) {
            return 'locked';
        }

        const amount =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (
            max != null &&
            amount >= max
        ) {
            return 'maxed';
        }
    
        const requirementsMet =
            Object.entries(item.requirements ?? {})
                .every(([id, required]) => {
    
                    const current =
                        this.stageProgress.get(id);
    
                    return current >= required;
                });
    
        if (!requirementsMet) {
            return 'insufficient';
        }
    
        return 'available';
    }

    // Build cards for current tab
    refreshCurrentTab() {
        const cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );

        const displayCards = cards.map(item => ({
        
            ...item,
        
            type: this.currentTab,
        
            amount:
                item.discovery ? null : this.stageProgress.get(item.id),
            
            max:
                item.discovery ? null : getItemMax(item, this.stageProgress),
            
            nextMax:
                item.gather ? getItemMax(item, this.stageProgress, 'next') : null,
                
            upgradeStats: this.getUpgrades(item),
        
            availability:
                this.getAvailability(item),
        
            getAmount: id => {
                return this.stageProgress.get(id);
            },
        
            canAction: () =>
                this.getAvailability(item) === 'available',
        
            onAction: () => {
                if (this.currentTab === 'gather') {
                    this.gather(item);
                }
        
                if (this.currentTab === 'create') {
                    this.create(item);
                }
                
                if (this.currentTab === 'discover') {
                    this.discover(item);
                }
            }
        
        }));

        this.viewport.showCards(
            displayCards
        );
    }

    // Update only affected cards
    updateAffectedCards(id) {
        const cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );
    
        cards.forEach(item => {
            const affectsAmount =
                item.id === id;
    
            const affectsRequirement =
                Object.keys(
                    item.requirements ?? {}
                ).includes(id);
            
            const affectsUpgrade =
                item.id === id &&
                item.gather?.upgrade?.enabled;
    
            if (
                affectsAmount ||
                affectsRequirement ||
                affectsUpgrade
            ) {

                const isDiscovery = item.discovery === true;
                
                this.viewport.updateCard(
                    item.id,
                    {
                        amount: isDiscovery ? null : this.stageProgress.get(item.id),
                        max: isDiscovery ? null : getItemMax(item, this.stageProgress),
                        upgradeStats: item.gather?.upgrade?.enabled ? this.getUpgrades(item) : null,
                        availability: this.getAvailability(item)
                    }
                );
            }
        });
    }

    // Discoveries
    getDiscoveryStatus(item) {
    
        if (this.stageProgress.isDiscovered(item.id)) {
            return 'completed';
        }
    
        const unlocked =
            item.startsUnlocked ||
            this.stageProgress.getUnlocked(item.id);
    
        if (!unlocked) {
            return 'locked';
        }
    
        const requirementsMet =
            Object.entries(item.requirements ?? {})
                .every(([id, required]) => {
                    return (
                        this.stageProgress.get(id) >= required
                    );
                });
    
        if (!requirementsMet) {
            return 'insufficient';
        }
    
        return 'available';
    }
    
    discover(item) {
        if (this.getDiscoveryStatus(item) !== 'available') {
            return;
        }
    
        this.stageProgress.discover(item.id);
    
        const unlocks = item.unlocks ?? {};
    
        // Unlock discoveries
        (unlocks.discoveries ?? []).forEach(id => {
            this.stageProgress.unlock(id);
        });
    
        // Unlock gather/create/etc items
        (unlocks.items ?? []).forEach(id => {
            this.stageProgress.unlock(id);
        });
    
        // Refresh cards because newly unlocked cards may appear
        this.refreshCurrentTab();
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
        this.removeTabListener?.();

        this.inventory?.destroy();
        this.viewport?.destroy();
        this.navigation?.destroy();
        this.messageStatus?.destroy();

        this.stageProgress?.destroy();
    }
}