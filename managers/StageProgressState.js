export default class StageProgressState {

    constructor(gameData) {

        this.gameData = gameData;

        // One shared object for all stage-progress data
        // If saved data already exists, it uses it.
        // If it doesn't, it creates {}
        this.data =
            gameData.stageProgress ??= {};
    }

    sync() {
        this.gameData.stageProgress =
            this.data;
    }
}