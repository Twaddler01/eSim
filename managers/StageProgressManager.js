import { getItemMax } from '../utils/stageHelpers.js';

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

        // Stores tracked objectives
        this.tracked =
            gameData.stageProgress?.tracked ?? {};

        this.unlocked =
            gameData.stageProgress?.unlocked ?? {};

        // For discover tab only
        this.objectiveCompletionCounter =
            gameData.stageProgress?.objectiveCompletionCounter ?? 0;

        // For tracker only
        this.objectiveTrackingCounter =
            gameData.stageProgress?.objectiveTrackingCounter ?? 0;

        // Observable changes
        this.events =
            new Phaser.Events.EventEmitter();
        
        // Add initial tracked objective (startsUnlocked)
        this.initializeObjectiveTracking();
    }

    // Availability
    getAvailability(item, tab) {
        // Objectives
        if (tab === 'discover') {
            return this.isObjectiveActive(
                item.id
            );
        }

        // CREATE ITEMS
        if (item.tab === 'create') {
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

        // GATHER ITEM
        const unlocked =
            item.startsUnlocked ||
            this.getUnlocked(item.id);

        if (!unlocked) {
            return 'locked';
        }

        const amount =
            this.get(item.id);
    
        const max =
            getItemMax(item, this);
    
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
                        this.get(id);
    
                    return current >= required;
                });
    
        if (!requirementsMet) {
            return 'insufficient';
        }

        return 'active';
    }

//--------------------------------
//ggg getCurrentTabCardData => item functions for GATHER
//--------------------------------

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

    getCreateData(item) {
        const requirements = item.requirements;
        if (!requirements || requirements === undefined) return;
        const reqItems = [];
        Object.entries(requirements).forEach(([req, val]) => {
            const currentCnt = this.get(req);
            const title = this.getItemTitle(req);
            if (title) {
                reqItems.push({
                    id: req,
                    title: title,
                    req: val,
                    cnt: currentCnt,
                    reqMet: currentCnt >= val
                });
            }
        });
        
        const producesItems = [];
        // Get produce data
        if (item.produces) {
            Object.entries(item.produces).forEach(([pro, val]) => {
                const title = this.getItemTitle(pro) ?? pro;
                producesItems.push({
                    id: pro,
                    title: title,
                    producesCnt: val
                });
            });
        }
        
        return {
            id: item.id,
            allReqMet: reqItems.every(requirement => requirement.reqMet),
            req: reqItems,
            produces: producesItems
        };
    }

    getCreateItems() {
        return this.stageItems.filter(item => item.tab === 'create');
    }

//--------------------------------
//ddd functions for DISCOVER
//--------------------------------

    // Gets all data for StageCard
    getObjectiveData() {
        const returnData = [];
        this.objectives.forEach(obj => {
    
            //if (!this.isObjectiveComplete(obj.id)) return;
    
            // Only include these types
            if (obj.type !== 'objective' &&
                obj.type !== 'child' &&
                obj.type !== 'parent') {
                return;
            }
    
            const data = {
                tab: 'discover',
                id: obj.id,
                title: obj.title,
                objectiveText: obj.objectiveText,
                description: obj.description,
                
                availability: this.getAvailability(obj, 'discover'),

                required: {
                    items: [],
                    objectives: [],
                    children: []
                },
    
                unlocked: {
                    items: [],
                    objectives: [],
                    children: []
                }
            };
    
            // ==========================================
            // REQUIRED
            // ==========================================
    
            if (obj.requirements?.items) {
                data.required.items =
                    this.fetchObjData(obj.requirements.items);
            }
    
            if (obj.requirements?.objectives) {
                data.required.objectives =
                    this.fetchObjData(obj.requirements.objectives);
            }
    
            // Parent children
            if (obj.children) {
                data.required.children =
                    this.fetchObjData(obj.children);
            }
    
            // ==========================================
            // UNLOCKED
            // ==========================================
    
            if (obj.unlocks?.items) {
                data.unlocked.items =
                    this.fetchObjData(obj.unlocks.items);
            }
    
            if (obj.unlocks?.objectives) {
                data.unlocked.objectives =
                    this.fetchObjData(obj.unlocks.objectives);
            }
    
            if (obj.unlocks?.children) {
                data.unlocked.children =
                    this.fetchObjData(obj.unlocks.children);
            }

            returnData.push(data);

            // TEST SORT
            const order = {
                active: 0,
                completed: 1,
                locked: 2
            };
        
            returnData.sort(
                (a, b) =>
                    order[a.availability] -
                    order[b.availability]
            );

        });
    
        return returnData;
    }

    // Helper ^
    fetchObjData(data) {
        if (!Array.isArray(data)) return [];
        return data.flatMap(item => {
            // ID only
            if (typeof item === 'string') {
                return {
                    id: item,
                    title: this.getTitle(item)
                };
            }
            // ID + amount
            if (item && typeof item === 'object') {
                return Object.entries(item).map(([id, amt]) => ({
                    id,
                    title: this.getTitle(id),
                    amt
                }));
            }
            return [];
        });
    }

    // States for DISCOVER TAB (getAvailability)
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

//--------------------------------
//obj getObjectiveCardData => functions for OBJECTIVES
//--------------------------------

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

//--------------------------------
//pobj getObjectiveCardData => functions for PARENT OBJECTIVES
//--------------------------------

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

    // For parent objectives only
    isObjectiveComplete(id) {
        return this.getObjectiveState(id).completed === true;
    }
    
//--------------------------------
//obj OTHER OBJECTIVE FUNCTIONS
//--------------------------------

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

// NEW -- WIP integrate into StageCard
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

// NEW -- WIP integrate into StageCard?
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
    
    /*
     * Calculate progress based on each
     * requirement independently.
     *
     * Example:
     *
     * Wood 5 / 10 = 50%
     * Stone 10 / 10 = 100%
     *
     * Overall = 75%
     */
    
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
    
    consumeObjectiveRequirements(objective) {
        const itemRequirements =
            objective.requirements?.items ?? [];
    
        itemRequirements.forEach(requirement => {
    
            Object.entries(requirement)
                .forEach(([id, amount]) => {
    
                    this.values[id] =
                        Math.max(
                            0,
                            this.get(id) - amount
                        );
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

    /*getSortedCurrentObjectives() {
        const objectives =
            this.getCurrentObjectives();
    
        const result = [];
        const used = new Set();
    
        // -----------------------------------------
        // 1. PARENTS
        // -----------------------------------------
    
        const parents =
            objectives.filter(
                objective =>
                    objective.type === 'parent' &&
                    !this.isObjectiveComplete(objective.id)
            );
    
        parents.forEach(parent => {
    
            result.push(parent);
            used.add(parent.id);
    
            // Find the currently active child
            const activeChild =
                objectives.find(
                    child =>
                        child.type === 'child' &&
                        child.parentId === parent.id &&
                        !this.isObjectiveComplete(child.id) &&
                        this.getObjectiveStatus(child.id) === 'active'
                );
    
            if (activeChild) {
                result.push(activeChild);
                used.add(activeChild.id);
            }
        });
    
        // -----------------------------------------
        // 2. OTHER INCOMPLETE OBJECTIVES
        // -----------------------------------------
    
        objectives.forEach(objective => {
    
            if (used.has(objective.id)) {
                return;
            }
    
            if (this.isObjectiveComplete(objective.id)) {
                return;
            }
    
            result.push(objective);
            used.add(objective.id);
        });

        // -----------------------------------------
        // 3. COMPLETED — MOST RECENT FIRST
        // -----------------------------------------
        
        const completed =
            objectives
                .filter(
                    objective =>
                        this.isObjectiveComplete(objective.id)
                )
                .sort(
                    (a, b) =>
                        this.getCompletionOrder(b.id) -
                        this.getCompletionOrder(a.id)
                );
        
        completed.forEach(objective => {
            result.push(objective);
        });
    
        return result;
    }*/
    
    getCompletionOrder(id) {
        return (
            this.getObjectiveState(id)
                .completedOrder
            ?? Number.MAX_SAFE_INTEGER
        );
    }

// --------------------------------------------------
//tobj OBJECTIVE TRACKING FUNCTIONS
// --------------------------------------------------

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
                this.objectives.find(
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

    isObjectiveTracked(id) {
        return this.tracked[id] === true;
    }
    
    setObjectiveTracked(id, tracked = true) {
        const objective =
            this.getObjective(id);
    
        if (!objective) {
            return false;
        }
    
        this._setTracked(id, tracked);
    
        this.sync();
    
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
    
    _setTracked(id, tracked) {
        if (tracked) {
            this.tracked[id] = true;
            this.objectiveTrackingCounter++;
    
            const state = this.getObjectiveState(id);
            state.trackingOrder = this.objectiveTrackingCounter;
            this.objectiveState[id] = state;
        } else {
            delete this.tracked[id];
            const state = this.getObjectiveState(id);
            delete state.trackingOrder;
        }
    }
    
    getTrackingOrder(id) {
        return (
            this.getObjectiveState(id)
                .trackingOrder
            ?? 0
        );
    }
    
    getTrackedObjectives(options = {}) {
        const objectives =
            this.getCurrentObjectives()
                .filter(objective => {
    
                    // Must be tracked
                    if (!this.isObjectiveTracked(objective.id)) {
                        return false;
                    }
    
                    // Tracker only shows objectives still in progress
                    if (this.isObjectiveComplete(objective.id)) {
                        return false;
                    }
    
                    return true;
                });
    
        if (!options.newestFirst) {
            return objectives;
        }
    
        // The property order of `tracked` represents
        // the order objectives were most recently tracked.
        const trackedOrder =
            Object.keys(this.tracked);
    
        const orderIndex =
            new Map(
                trackedOrder.map(
                    (id, index) =>
                        [id, index]
                )
            );
    
        return objectives.sort(
            (a, b) => {
    
                // Parents always go to the bottom.
                if (
                    a.type === 'parent' &&
                    b.type !== 'parent'
                ) {
                    return 1;
                }
    
                if (
                    a.type !== 'parent' &&
                    b.type === 'parent'
                ) {
                    return -1;
                }
    
                // Otherwise newest tracked objective first.
                return (
                    orderIndex.get(b.id) -
                    orderIndex.get(a.id)
                );
            }
        );
    }
    
    initializeObjectiveTracking() {
        const stage =
            this.getCurrentStageId();
    
        const startingObjective =
            this.objectives.find(
                objective =>
                    objective.stage === stage &&
                    objective.startsUnlocked === true &&
                    !this.isObjectiveComplete(objective.id)
            );
    
        if (!startingObjective) {
            return;
        }
    
        if (
            this.isObjectiveTracked(
                startingObjective.id
            )
        ) {
            return;
        }
    
        this.tracked[startingObjective.id] = true;
    
        this.sync();
    }

    // --------------------------------------------------
    // GETTERS AND SETTERS
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

    // Gwt any title matching id
    getTitle(id) {
        const stage = this.stageItems.find(i => i.id === id);
        if (stage) return stage.title;
        const objective = this.objectives.find(i => i.id === id);
        if (objective) return objective.title;
        return id;
    }

    // UNLOCK
    getAllUnlocked() {
        return this.unlocked;
    }
    
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
        this.gameData.stageProgress = {
            amounts: this.values,
            gatherLevels: this.gatherLevels,
            objectives: this.objectiveState,
            unlocked: this.unlocked,
            tracked: this.tracked,
            objectiveCompletionCounter: this.objectiveCompletionCounter,
            objectiveTrackingCounter: this.objectiveTrackingCounter
        };
    }

    // Events
    on(event, handler) {
        this.events.on(event, handler);
    }

    off(event, handler) {
        this.events.off(event, handler);
    }

    getCurrentStage() {
        return this.stage;
    }

//--------------------------------
// STAGE FUNCTIONS
//--------------------------------

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