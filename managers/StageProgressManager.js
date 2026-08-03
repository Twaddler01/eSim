export default class StageProgressManager {

    constructor(gameData) {

        this.gameData = gameData;

        // Player's current stage
        this.stage =
            gameData.lifeStage.stage;

        // Current quantities
        this.values =
            gameData.stageProgress ?? {};

    }


    // --------------------------------------------------
    // Get amount
    // --------------------------------------------------

    get(id) {

        return this.values[id] ?? 0;
    }


    // --------------------------------------------------
    // Set amount
    // --------------------------------------------------

    set(id, amount) {

        this.values[id] =
            Math.max(0, amount);

        this.sync();
    }


    // --------------------------------------------------
    // Add amount
    // --------------------------------------------------

    add(id, amount = 1) {
        const current = this.get(id);
        this.values[id] = Math.max(0, current + amount);
        this.sync();
        return this.values[id];
    }


    // --------------------------------------------------
    // Remove amount
    // --------------------------------------------------

    remove(id, amount = 1) {

        const current =
            this.get(id);

        this.values[id] =
            Math.max(
                0,
                current - amount
            );

        this.sync();

        return this.values[id];
    }


    // --------------------------------------------------
    // Sync back into gameData
    // --------------------------------------------------

    sync() {

        this.gameData.stageProgress =
            this.values;
    }
}