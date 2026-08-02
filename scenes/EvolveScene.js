import StageUI from '../ui/stage/StageUI.js';

export default class EvolveScene extends Phaser.Scene {

    constructor() {
        super('EvolveScene');
    }

    create() {

        this.stageUI = new StageUI(this);

    }
}