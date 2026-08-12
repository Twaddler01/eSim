export default class StageProgressManager {

    constructor(gameData, stageData, stageItems, masterObjectives) {

        this.gameData = gameData;
        this.stageData = stageData;
        this.stageItems = stageItems;
        this.masterObjectives = masterObjectives;

        // Player's current stage
        this.stage =
            gameData.currentStage.stage;

        // Current quantities
        this.values =
            gameData.stageProgress?.amounts ?? {};

        // Gather upgrade levels
        this.gatherLevels =
            gameData.stageProgress?.gatherLevels ?? {};

        this.discoveries =
            gameData.stageProgress?.discoveries ?? {};

        this.unlocked =
            gameData.stageProgress?.unlocked ?? {};

        this.unlockedMasterObjectives =
            new Set(
                gameData.stageProgress?.unlockedMasterObjectives ?? []
            );

        this.completedMasterObjectives =
            new Set(
                gameData.stageProgress?.completedMasterObjectives ?? []
            );

        // Observable changes
        this.events =
            new Phaser.Events.EventEmitter();
    }


    // --------------------------------------------------
    // Get all values
    // --------------------------------------------------

    getAll() {
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

        this.events.emit(
            'updated',
            {
                type: 'amount',
                id,
                amount: newAmount
            }
        );

        return newAmount;
    }

    // UNLOCK
    getUnlocked(id) {
        return this.unlocked[id] === true;
    }
    
    unlock(id) {
        if (this.unlocked[id]) {
            return;
        }
        this.unlocked[id] = true;
        this.sync();
        this.events.emit('updated', {
            id,
            type: 'unlock'
        });
    }
    
    lock(id) {
        delete this.unlocked[id];
        this.sync();
        this.events.emit('updated', {
            id,
            type: 'unlock'
        });
    }

    isMasterObjectiveUnlocked(id) {
        return this.unlockedMasterObjectives.has(id);
    }

    unlockMasterObjective(id) {
        if (this.unlockedMasterObjectives.has(id)) {
            return false;
        }
        this.unlockedMasterObjectives.add(id);
        this.sync();
        this.events.emit(
            'updated',
            {
                type: 'master-unlock',
                id
            }
        );
        return true;
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
        return this.set(
            id,
            this.get(id) - amount
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

    // Discoveries
    isDiscovered(id) {
        return this.discoveries[id] === true;
    }

    // Returns any objective, beyond just a discovery
    isObjectiveComplete(id) {
        return this.isDiscovered(id);
    }

    discover(id) {
    
        if (this.isDiscovered(id)) {
            return false;
        }
    
        const item =
            this.stageItems.find(
                item => item.id === id
            );
    
        if (!item) {
            console.warn(
                `discover() - Unknown item: ${id}`
            );
            return false;
        }
    
        // Mark discovery complete
        this.discoveries[id] = true;
    
        // Process unlocks
        const unlocks =
            item.unlocks ?? {};
    
        // Master objectives
        (unlocks.master ?? [])
            .forEach(masterId => {
                this.unlockMasterObjective(masterId);
            });
    
        // Discoveries
        (unlocks.discoveries ?? [])
            .forEach(discoveryId => {
                this.unlock(discoveryId);
            });
    
        // Resources / items
        (unlocks.items ?? [])
            .forEach(itemId => {
                this.unlock(itemId);
            });
    
        // Save state
        this.sync();
    
        // See whether this completed a master objective
        this.checkMasterObjectives();
    
        // Notify UI
        this.events.emit(
            'updated',
            {
                type: 'discovery',
                id
            }
        );
    
        return true;
    }

    // Sync to gameData
    sync() {
        this.gameData.stageProgress = {
            amounts: this.values,
            gatherLevels: this.gatherLevels,
            discoveries: this.discoveries,
            unlocked: this.unlocked,
            tracked: this.tracked, // WIP
            completedMasterObjectives: [...this.completedMasterObjectives],
            unlockedMasterObjectives: [...this.unlockedMasterObjectives]
        };
    }

    // Events
    on(event, handler) {
        this.events.on(event, handler);
    }

    off(event, handler) {
        this.events.off(event, handler);
    }

    getGatherUpgradeStats(id, item) {
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade?.enabled) {
            return null;
        }
    
        const level =
            this.getGatherLevel(id);
    
        const rateIncrease =
            upgrade.rateIncrease ?? 0;
    
        const maxIncrease =
            upgrade.maxIncrease ?? 0;

        return {
            level,
            rateIncrease: level * rateIncrease, // gatherIncrease
            maxIncrease: level * maxIncrease
        };
    }

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

    isMasterObjectiveComplete(objective) {
        return objective.objectives.every(id =>
            this.isDiscovered(id)
        );
    }
    
    getMasterObjectiveProgress(objective) {
        const total =
            objective.objectives.length;

        const completed =
            objective.objectives.filter(id =>
                this.isDiscovered(id)
            ).length;
    
        return {
            completed,
            total,
            percent:
                total === 0
                    ? 1
                    : completed / total
        };
    }
    
    getActiveMasterObjective() {
    
        const stage =
            this.getCurrentStageId();
    
        return this.masterObjectives.find(
            objective =>
                objective.stage === stage &&
                this.isMasterObjectiveUnlocked(objective.id) &&
                !this.isMasterObjectiveComplete(objective)
        ) ?? null;
    }

    getMasterObjectiveCardData() {
    
        const objective =
            this.getActiveMasterObjective();
    
        if (!objective) {
            return null;
        }
    
        const progress =
            this.getMasterObjectiveProgress(objective);
    
        return {
            id: objective.id,
            title: objective.title,
            description: objective.description,
            amount: progress.completed,
            max: progress.total,
            percent: progress.percent,
            availability: 'available',
            actionLabel: 'VIEW',
            type: 'discover',
            master: true,
            objectives: objective.objectives
        };
    }
    
    getCurrentDiscovery() {
        const stage =
            this.getCurrentStageId();
        return (
            this.stageItems.find(item =>
                item.discovery &&
                item.stage === stage &&
                item.tracked &&
                !this.isDiscovered(item.id) &&
                (
                    item.startsUnlocked ||
                    this.getUnlocked(item.id)
                )
            ) ?? null
        );
    }

    checkMasterObjectives() {
        this.masterObjectives.forEach(objective => {
    
            if (
                this.completedMasterObjectives.has(objective.id)
            ) {
                return;
            }
    
            if (!this.isMasterObjectiveComplete(objective)) {
                return;
            }
    
            this.completedMasterObjectives.add(
                objective.id
            );
    
            // Unlock discoveries
            (objective.unlocks?.discoveries ?? [])
                .forEach(id => {
                    this.unlock(id);
                });
    
            // Unlock items
            (objective.unlocks?.items ?? [])
                .forEach(id => {
                    this.unlock(id);
                });
    
            this.sync();
    
            this.events.emit(
                'updated',
                {
                    type: 'master-complete',
                    id: objective.id
                }
            );
        });
    }

    // Destroy
    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }
}

// WIP functions:
/*
getObjective(id)
getObjectiveStatus(id)
isObjectiveUnlocked(id)
isObjectiveComplete(id)
isObjectiveAvailable(id)
unlockObjective(id)
completeObjective(id)
getActiveObjectives()
getTrackedObjectives()
getParentProgress(id)
*/