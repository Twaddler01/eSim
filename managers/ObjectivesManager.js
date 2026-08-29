import { listenToEvent } from '../utils/stageHelpers.js';

export default class ObjectivesManager {

    constructor(stageProgress, stageProgressState) {

        this.stageProgress = stageProgress;
        this.gameData = stageProgress.gameData;
        this.stageData = stageProgress.stageData;
        this.stageItems = stageProgress.stageItems;
        this.stageObjectives = stageProgress.objectives;

        // Sync to save
        this.state = stageProgressState;

        // Objective-specific state
        this.objectiveState =
            this.state.data.objectives ??= {};

        const hasTrackingData =
            this.state.data.tracked !== undefined;

        // Objective tracking
        this.tracked =
            this.state.data.tracked ??= {};
        
        this.trackingInitialized =
            this.state.data.trackingInitialized ?? false;

        // For discover tab only
        this.objectiveCompletionCounter =
            this.state.data
                .objectiveCompletionCounter ?? 0;

        // For tracker only
        this.objectiveTrackingCounter =
            this.state.data
                .objectiveTrackingCounter ?? 0;

        // Observable changes
        this.events =
            new Phaser.Events.EventEmitter();
        
        // Add initial tracked objective (startsUnlocked)
        this.initializeObjectiveTracking();
        
    }

    // Get amount
    get(id) {
        return this.stageProgress.values[id] ?? 0;
    }

    getItem(id) {
        return this.stageItems.find(
            item => item.id === id
        ) ?? null;
    }

    // Availability / for getCardCanAction() ('active' = true)
    getObjectiveAvailability(item) {
        return this.isObjectiveActive(
            item.id
        );
    }

    // Helper ^ getObjectiveAvailability
    isObjectiveActive(id) {
        const state =
            this.getObjectiveState(id);

        const isStartsUnlocked = () => {
            const obj = this.getObjective(id);
            if (obj.startsUnlocked) {
                return obj.id;
            }
            return false;
        };
        const startsUnlocked = isStartsUnlocked();
        const activeFirst = startsUnlocked && state.completed !== true;

        let defaultReturn = 'locked';
        if (
            (state.unlocked === true && state.completed !== true) || 
            activeFirst
        ) {
            return 'active'; // In Progress
        }
        
        if (state.completed === true) {
            return 'completed';
        }

        return defaultReturn;
    }

    // helper ^ isObjectiveActive
    getObjectiveState(id) {
        return this.objectiveState[id] ?? {
            unlocked: false,
            completed: false
        };
    }

    // helper ^ getObjective
    getObjective(id) {
        return this.stageObjectives.find(
            objective => objective.id === id
        ) ?? null;
    }

    // ==========================================
    // Objective tracking
    // ==========================================
    
    initializeObjectiveTracking() {
        // Already initialized — respect saved tracking state.
        if (this.trackingInitialized) {
            return;
        }
    
        const stage =
            this.getCurrentStageId();
    
        const startingObjective =
            this.stageObjectives.find(
                objective =>
                    objective.stage === stage &&
                    objective.startsUnlocked === true &&
                    !this.isObjectiveComplete(
                        objective.id
                    )
            );
    
        if (startingObjective) {
            this._setTracked(
                startingObjective.id,
                true
            );
    
            // StageDiscoveryTracker
            this.events.emit(
                'updated',
                {
                    type: 'objective-track',
                    id: startingObjective.id,
                    tracked: true
                }
            );
        }

        // Even if there wasn't a starting objective,
        // initialization has now happened.
        this.trackingInitialized = true;
    
        this.state.data.trackingInitialized = true;
    
        this.sync();
    }

    // helper ^ initializeObjectiveTracking
    getCurrentStageId() {
        const stage = this.stageData.find(s => s.stage === this.gameData.currentStage.stage);
        if (!stage) return 'creation';
        return stage.id;
    }

    // helper ^ initializeObjectiveTracking
    // For parent objectives only
    isObjectiveComplete(id) {
        return this.getObjectiveState(id).completed === true;
    }

    // helper ^ initializeObjectiveTracking
    isObjectiveTracked(id) {
        return this.tracked[id] === true;
    }

    setObjectiveTracked(id, tracked = true) {
        const objective =
            this.getObjective(id);
    
        if (!objective) {
            return false;
        }
    
        // Only unlocked, incomplete objectives
        // can be tracked.
        if (
            tracked &&
            (
                !this.isObjectiveUnlocked(id) ||
                this.isObjectiveComplete(id)
            )
        ) {
            return false;
        }
    
        this._setTracked(id, tracked);
    
        this.sync();
        
        // StageDiscoveryTracker
        this.events.emit(
            'updated',
            {
                type: 'objective-track',
                id,
                tracked
            }
        );
    
        return tracked;
    }

    // Regarding this.tracked ^ initializeObjectiveTracking, isObjectiveTracked
    _setTracked(id, tracked) {
        const state =
            this.getObjectiveState(id);
    
        if (tracked) {
            // Already tracked — don't create a new order.
            if (this.tracked[id] === true) {
                return;
            }
    
            this.tracked[id] = true;
    
            this.objectiveTrackingCounter++;
    
            state.trackingOrder =
                this.objectiveTrackingCounter;
    
        } else {
    
            delete this.tracked[id];
            delete state.trackingOrder;
        }
    
        this.objectiveState[id] = state;
    }

    getTrackingOrder(id) {
        return (
            this.getObjectiveState(id)
                .trackingOrder
            ?? Number.MAX_SAFE_INTEGER
        );
    }

    getTrackedObjectives(options = {}) {
        const objectives =
            this.getCurrentObjectives()
                .filter(objective => {
    
                    if (
                        !this.isObjectiveTracked(
                            objective.id
                        )
                    ) {
                        return false;
                    }
    
                    if (
                        this.isObjectiveComplete(
                            objective.id
                        )
                    ) {
                        return false;
                    }
    
                    return true;
                });
    
        if (!options.newestFirst) {
            return objectives;
        }
    
        return objectives.sort(
            (a, b) => {
                // Newest tracked first.
                return (
                    this.getTrackingOrder(b.id) -
                    this.getTrackingOrder(a.id)
                );
            }
        );
    }

    // ==========================================
    // Complete
    // ==========================================

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
    
        // Deduct requirement costs
        this.consumeObjectiveRequirements(objective);
    
        const state =
            this.getObjectiveState(id);
    
        state.completed = true;
        
        delete this.tracked[id];
        delete state.trackingOrder;
        
        this.objectiveCompletionCounter++;
        
        state.completedOrder =
            this.objectiveCompletionCounter;
    
        this.objectiveState[id] =
            state;
    
        // Flow
        //this.processObjectiveUnlocks(id);

        this.sync();
    
        this.events.emit(
            'updated',
            {
                type: 'objective-complete',
                id,
                objective
            }
        );

        return true;
    }

    // helper ^ completeObjective
    // FLOW: completeObjective ->  processObjectiveUnlocks
    processObjectiveUnlocks(id) {
    
        const objective =
            this.getObjective(id);
    
        if (!objective) {
            return false;
        }

        // Unlock objectives
        (objective.unlocks?.objectives ?? [])
            .forEach(objectiveId => {
                this.unlockObjective(objectiveId);
            });
    
        // Unlock items
        (objective.unlocks?.items ?? [])
            .forEach(itemId => {
                this.stageProgress.unlock(itemId);
            });
    
        return true;
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
                total > 0
                    ? completed / total
                    : 0
        };
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
    
        // All objective requirements must be met.
        // For parents this includes:
        // - item requirements
        // - all child objectives
        if (!this.areObjectiveRequirementsMet(objective)) {
            return 'unlocked';
        }
    
        return 'active';
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

    areObjectiveRequirementsMet(objective) {
    
        // Item requirements
        const itemRequirements =
            objective.requirements?.items ?? [];
    
        const itemsMet =
            itemRequirements.every(
                requirement =>
                    Object.entries(requirement)
                        .every(([id, required]) =>
                            this.get(id) >= required
                        )
            );
    
        if (!itemsMet) {
            return false;
        }
    
        // Child objectives
        const childRequirements =
            objective.children ?? [];
    
        const childrenMet =
            childRequirements.every(
                childId =>
                    this.isObjectiveComplete(childId)
            );
    
        return childrenMet;
    }

    getObjectiveRequirements(id) {
        const objective =
            this.getObjective(id);
    
        if (!objective) {
            return [];
        }
    
        const requirements = [];
    
        const itemRequirements =
            objective.requirements?.items ?? [];
    
        itemRequirements.forEach(requirement => {
    
            Object.entries(requirement)
                .forEach(([itemId, required]) => {
    
                    requirements.push({
                        id: itemId,
                        required,
                        amount: this.get(itemId),
                        complete:
                            this.get(itemId) >= required
                    });
                });
        });
    
        return requirements;
    }

    getObjectiveProgressData(id) {
        const objective =
            this.getObjective(id);
    
        if (!objective) {
            return {
                completed: 0,
                total: 0,
                percent: 0,
                ready: false
            };
        }
    
        // Parent objective
        if (objective.type === 'parent') {
    
            const children =
                objective.children ?? [];
    
            const childrenCompleted =
                children.filter(
                    childId =>
                        this.isObjectiveComplete(childId)
                ).length;
    
            const childrenTotal =
                children.length;
    
    
            // Parent's own item requirements
            const requirements =
                this.getObjectiveRequirements(id);
    
            const requirementsCompleted =
                requirements.filter(
                    requirement =>
                        requirement.complete
                ).length;
    
            const requirementsTotal =
                requirements.length;
    
    
            const completed =
                childrenCompleted +
                requirementsCompleted;
    
            const total =
                childrenTotal +
                requirementsTotal;
    
    
            const percent =
                total > 0
                    ? completed / total
                    : 0;
    
    
            const childrenReady =
                childrenCompleted === childrenTotal;
    
            const requirementsReady =
                requirements.every(
                    requirement =>
                        requirement.complete
                );
    
    
            return {
                completed,
                total,
                percent,
    
                ready:
                    childrenTotal > 0 &&
                    childrenReady &&
                    requirementsReady,
    
                // Useful if the UI wants separate displays later
                childrenCompleted,
                childrenTotal,
    
                requirementsCompleted,
                requirementsTotal
            };
        }
    
        // Normal objective
        const requirements =
            this.getObjectiveRequirements(id);
    
        const total =
            requirements.length;
    
        if (total === 0) {
            return {
                completed: 0,
                total: 0,
                percent: 1,
                ready: true
            };
        }

        const percent =
            requirements.reduce(
                (sum, requirement) => {
    
                    const requirementPercent =
                        Math.min(
                            1,
                            requirement.amount /
                            requirement.required
                        );
    
                    return sum + requirementPercent;
    
                },
                0
            ) / total;
    
        const completed =
            requirements.filter(
                requirement =>
                    requirement.complete
            ).length;
    
        const ready =
            requirements.every(
                requirement =>
                    requirement.complete
            );
    
        return {
            completed,
            total,
            percent,
            ready
        };
    }

    consumeObjectiveRequirements(objective) {
        const itemRequirements =
            objective.requirements?.items ?? [];
    
        itemRequirements.forEach(requirement => {
    
            Object.entries(requirement)
                .forEach(([id, amount]) => {
                    this.stageProgress.remove(id, amount);
                });
        });
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
        
        // Automatically track newly unlocked objective
        this._setTracked(id, true);
    
        this.sync();
    
        // StageDiscoveryTracker
        this.events.emit(
            'updated',
            {
                type: 'objective-unlock',
                id
            }
        );
    
        return true;
    }

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

    getCompletionOrder(id) {
        return (
            this.getObjectiveState(id)
                .completedOrder
            ?? Number.MAX_SAFE_INTEGER
        );
    }

    objectiveUnlockList(item) {
        const itemUnlocked = item.unlocks?.items ?? [];
        const objectivesUnlocked = item.unlocks?.objectives ?? [];
        const items = [];
        const objectives = [];

        for (const unlockId of itemUnlocked) {
            const itemData =
                this.stageItems.find(
                    i => i.id === unlockId
                );
    
            if (itemData) {
                items.push(itemData.title);
            }
        }
    
        for (const unlockId of objectivesUnlocked) {
            const objData =
                this.stageObjectives.find(
                    i => i.id === unlockId
                );
    
            if (objData) {
                objectives.push(objData.title);
            }
        }
    
        return {
            items,
            objectives
        };
    }

    // Returns an array of objective required items (from stageItems)
    getReqItems(id) {
        // NOTE: this.objectives = stageObjectives
        const thisItem = this.objectives.find(i => i.id === id);

        let result = [];
        
        const reqItems = thisItem?.requirements?.items;
        
        if (reqItems) {
            reqItems.forEach(item => {
                const [[reqId, required]] = Object.entries(item);
                //console.log(`ID: ${reqId}, Value: ${required}`);
                const matchedId = this.stageItems.find(i => i.id === reqId);
                result.push(matchedId);
            });
        }

        return result;
    }

    // Tracking
    getCurrentObjectives() {
        const stage =
            this.getCurrentStageId();
    
        const result =
            this.stageObjectives.filter(objective => {
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

    sync() {
        this.state.sync();
    }

    // Events
    on(event, handler) {
        this.events.on(event, handler);
    }
    
    off(event, handler) {
        this.events.off(event, handler);
    }

    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }

}