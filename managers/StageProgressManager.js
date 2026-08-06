export default class StageProgressManager {

    constructor(gameData) {

        this.gameData = gameData;

        // Player's current stage
        this.stage =
            gameData.lifeStage.stage;

        // Current quantities
        this.values =
            gameData.stageProgress?.amounts ?? {};

        // Gather upgrade levels
        this.gatherLevels =
            gameData.stageProgress?.gatherLevels ?? {};

        this.discoveries =
            gameData.stageProgress?.discoveries ?? {};

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
            'gather-upgrade',
            id,
            newLevel
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

    discover(id) {
        if (this.isDiscovered(id)) {
            return false;
        }
        this.discoveries[id] = true;
    
        this.sync();
    
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
            discoveries: this.discoveries
        };
    }

    // Events
    on(event, handler) {
        this.events.on(event, handler);
    }

    off(event, handler) {
        this.events.off(event, handler);
    }

    // Destroy
    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }
}