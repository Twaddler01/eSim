export default class StageProgressManager {

    constructor(gameData) {

        this.gameData = gameData;

        this.stage =
            gameData.lifeStage.stage;

        this.values =
            gameData.stageProgress;

    }


    get(id) {

        return this.values[id] ?? 0;
    }


    set(id, amount) {

        this.values[id] =
            Math.max(0, amount);

        this.sync();
    }


    add(id, amount = 1) {

        const current =
            this.get(id);

        this.values[id] =
            current + amount;

        this.sync();

        return this.values[id];
    }


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


    sync() {

        this.gameData.stageProgress =
            this.values;
    }

}