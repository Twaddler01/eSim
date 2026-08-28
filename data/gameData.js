// ./data/gameData.js
export const messageData = [];

export const currentStage = {
    stage: 0
};

// Prinary structure for storing/saving data
export const stageProgress = {
    amounts: {},
    gatherLevels: {},
    discoveries: {},
    unlocked: {},
    tracked: {}
};

// Combined data (rootData) for saving, etc
export const gameData = {
    messageData,
    elapsedTime: 0,
    currentStage,
    stageProgress
};