//import StageUI from '../ui/stage/StageUI.js';
import { gameData } from '../data/gameData.js';
import GameTimer from '../systems/GameTimer.js';

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
        this.gameTimer = new GameTimer(gameData);

        this.stageUI = new StageUI(this);

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }
    
    update(time, delta) {
        this.gameTimer.update(delta);
    }
    
    shutdown() {
        this.stageUI?.destroy();
    }
}