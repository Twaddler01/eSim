export default class StageProgressManager {

    constructor(gameData, stageData, stageItems, stageObjectives) {

        this.gameData = gameData;
        this.stageData = stageData;
        this.stageItems = stageItems;
        this.objectives = stageObjectives;

        // Player's current stage
        this.stage =
            gameData.currentStage.stage;

        // Current quantities
        this.values =
            gameData.stageProgress?.amounts ?? {};

        // Gather upgrade levels
        this.gatherLevels =
            gameData.stageProgress?.gatherLevels ?? {};

        // Stores unlocked, completed only
        this.objectiveState =
            gameData.stageProgress?.objectives ?? {};

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

//////// NEW OBJECTIVES
getObjective(id) {
    return this.objectives.find(
        objective => objective.id === id
    ) ?? null;
}

getObjectiveState(id) {
    return this.objectiveState[id] ?? {
        unlocked: false,
        completed: false
    };
}

isObjectiveUnlocked(id) {
    const objective =
        this.getObjective(id);

    if (!objective) {
        return false;
    }
    if (objective.startsUnlocked) {
        return true;
    }
    return this.getObjectiveState(id).unlocked === true;
}

isObjectiveComplete(id) {
    return this.getObjectiveState(id).completed === true;
}

areObjectiveRequirementsMet(objective) {
    const requirements =
        objective.requirements ?? {};

    const itemRequirements =
        requirements.items ?? [];

    return itemRequirements.every(
        requirement => {
            return Object.entries(requirement)
                .every(([id, required]) => {

                    return this.get(id) >= required;
                });
        }
    );
}

getObjectiveStatus(id) {
    const objective =
        this.getObjective(id);

    if (!objective) {
        return 'locked';
    }

    if (this.isObjectiveComplete(id)) {
        return 'completed';
    }

    if (!this.isObjectiveUnlocked(id)) {
        return 'locked';
    }

    // Parent objectives require ALL children
    // to be completed before becoming active.
    if (objective.type === 'parent') {
        if (!this.areAllChildrenComplete(id)) {
            return 'unlocked';
        }
        return 'active';
    }

    // Normal objective requirements
    if (!this.areObjectiveRequirementsMet(objective)) {
        return 'unlocked';
    }

    return 'active';
}
/*
LOCKED
Not unlocked yet.
creation_day_2
before Day 1 unlocks it.

UNLOCKED
The player has access to it, but hasn't satisfied its requirements yet.
Example:
CREATION DAY 1
Unlocked ✓
Darkness: 4 / 10

STATUS: UNLOCKED
ACTIVE
Unlocked and requirements are currently satisfied, so the player can perform the objective.
CREATION DAY 1
Unlocked ✓
Darkness: 10 / 10

STATUS: ACTIVE
[COMPLETE]
COMPLETED
The objective has been completed.
CREATION DAY 1
STATUS: COMPLETED
*/

getTrackedObjectives() {
    return this.getCurrentObjectives()
        .filter(
            objective =>
                objective.tracked
        );
}

getParentProgress(id) {
    const objective =
        this.getObjective(id);

    if (
        !objective ||
        objective.type !== 'parent'
    ) {
        return null;
    }

    const children =
        objective.children ?? [];

    const completed =
        children.filter(
            childId =>
                this.isObjectiveComplete(childId)
        ).length;

    const total =
        children.length;

    return {
        completed,
        total,
        percent:
            total === 0
                ? 1
                : completed / total
    };
}

completeObjective(id) {
    const objective =
        this.getObjective(id);

    if (!objective) {
        return false;
    }

    if (
        this.getObjectiveStatus(id) !==
        'active'
    ) {
        return false;
    }

    // Parent must have every child completed.
    if (
        objective.type === 'parent' &&
        !this.areAllChildrenComplete(id)
    ) {
        return false;
    }

    const state =
        this.getObjectiveState(id);

    state.completed = true;

    this.objectiveState[id] =
        state;

    // Unlock child/other objectives
    (objective.unlocks?.objectives ?? [])
        .forEach(objectiveId => {
            this.unlockObjective(objectiveId);
        });

    // Unlock items
    (objective.unlocks?.items ?? [])
        .forEach(itemId => {
            this.unlock(itemId);
        });

    this.sync();

    this.events.emit(
        'updated',
        {
            type: 'objective-complete',
            id
        }
    );

    return true;
}

getCurrentObjectives() {

    const stage =
        this.getCurrentStageId();

    const result =
        this.objectives.filter(objective => {
            const sameStage =
                objective.stage === stage;

            const unlocked =
                this.isObjectiveUnlocked(
                    objective.id
                );
            const complete =
                this.isObjectiveComplete(
                    objective.id
                );

            return (
                sameStage &&
                (unlocked || complete)
            );
        });

    return result;
}

unlockObjective(id) {
    const objective =
        this.getObjective(id);

    if (!objective) {
        return false;
    }

    const state =
        this.getObjectiveState(id);

    if (state.unlocked) {
        return false;
    }

    state.unlocked = true;

    this.objectiveState[id] =
        state;

    this.sync();

    this.events.emit(
        'updated',
        {
            type: 'objective-unlock',
            id
        }
    );

    return true;
}

// For parent objectives
areAllChildrenComplete(id) {
    const objective =
        this.getObjective(id);

    if (!objective || objective.type !== 'parent') {
        return false;
    }

    return objective.children.every(
        childId =>
            this.isObjectiveComplete(childId)
    );
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

    // Sync to gameData
    sync() {
        this.gameData.stageProgress = {
            amounts: this.values,
            gatherLevels: this.gatherLevels,
            //discoveries: this.discoveries, // OLD
            objectives: this.objectiveState,
            unlocked: this.unlocked,
            tracked: this.tracked
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

    // Destroy
    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }
}

// WIP functions:
/*
getObjective()
getObjectiveState()
isObjectiveUnlocked()
isObjectiveComplete()
areObjectiveRequirementsMet()
getObjectiveStatus()
unlockObjective()
completeObjective()
getCurrentObjectives() --
getTrackedObjectives()
getParentProgress()
*/