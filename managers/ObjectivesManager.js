export default class ObjectivesManager {

    constructor(stageProgress, stageObjectives) {
        this.stageProgress =
            stageProgress;

        this.objectives =
            stageObjectives;

        // Objective-specific state
        this.objectiveState =
            stageProgress.gameData
                .stageProgress?.objectives ?? {};

        this.tracked =
            stageProgress.gameData
                .stageProgress?.tracked ?? {};

        // etc...
    }






}