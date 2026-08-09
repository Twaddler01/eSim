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
        
        // Make it available to other scenes
        this.registry.set(
            'saveManager',
            saveManager
        );

        if (gameData.lifeStage.stage < 1) {
            this.scene.start('CreationScene');
        } else {
            this.scene.start('MainScene');
        }
    }
}