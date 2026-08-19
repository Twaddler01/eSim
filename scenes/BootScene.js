import { gameData } from '../data/gameData.js';
import SaveManager from '../systems/SaveManager.js';

export default class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    create() {
        const saveManager = new SaveManager(
            gameData,
            'saveState',
            5000
        );
        
        this.registry.set(
            'saveManager',
            saveManager
        );
        
        // IN OTHER SCENES
        // this.saveManager = this.scene.registry.get('saveManager');

        if (gameData.currentStage.stage < 1) {
            this.scene.start('CreationScene');
        } else {
            this.scene.start('MainScene');
        }
    }
}

/*
try {
    //
}
} catch (error) {
    console.error(error.stack);
}
*/