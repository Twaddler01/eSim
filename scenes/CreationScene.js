import StageUI from '../ui/stage/StageUI.js';
import { gameData } from '../data/gameData.js';
import { stageData, stageItems, stageObjectives } from '../data/stageData.js';
import AutoGatherManager from '../managers/AutoGatherManager.js';
import StageProgressManager from '../managers/StageProgressManager.js';

export default class CreationScene extends Phaser.Scene {

    constructor() {
        super('CreationScene');

        this.depths = {
            background: 0,
            viewport: 10,
            inventory: 10,
            cards: 20,
            messages: 50,
            navigation: 100
        };
    }

    create() {
        this.gameTimer = 
            this.game.registry.get('gameTimer');

        this.stageProgress =
            new StageProgressManager(gameData, stageData, stageItems, stageObjectives);

        this.game.registry.set(
            'stageProgress',
            this.stageProgress
        );

        this.autoGather =
            new AutoGatherManager(
                this.stageProgress
            );

        this.stageUI = new StageUI(this);

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }
    
    update(time, delta) {
        this.gameTimer.update(delta);
        this.autoGather.update(delta);
    }
    
    shutdown() {
        this.stageUI?.destroy();
    }
}