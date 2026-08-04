export default class StageProgressManager {

    constructor(gameData) {
        this.gameData = gameData;
        
        // Player's current stage
        this.stage = gameData.lifeStage.stage;
        
        // Current quantities
        this.values = gameData.stageProgress ?? {};

        this.events = new Phaser.Events.EventEmitter();
    }

    getAll() {
        return { ...this.values };
    }

    // Get
    get(id) {
        return this.values[id] ?? 0;
    }

    // Set
    set(id, amount) {
        const newAmount = Math.max(0, amount);

        this.values[id] = newAmount;

        this.sync();

        this.events.emit(
            'changed',
            id,
            newAmount
        );

        return newAmount;
    }

    // Add
    add(id, amount) {
        const current = this.get(id);

        return this.set(id, current + amount);
    }

    // Remove
    remove(id, amount = 1) {
        const current = this.get(id);

        return this.set(id, current - amount);
    }

    // Events
    on(event, handler) {
        this.events.on(event, handler);
    }
    
    off(event, handler) {
        this.events.off(event, handler);
    }

    // Sync
    sync() {
        this.gameData.stageProgress =
            this.values;
    }

    // Destroy
    destroy() {
        this.events.removeAllListeners();
        this.events.destroy();
    }
}