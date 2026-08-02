import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { stageData } from '../../data/stageData.js';

export default class StageUI {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.width =
            options.width ??
            scene.scale.width;

        this.height =
            options.height ??
            scene.scale.height;

        this.create();
    }


    create() {

        console.log('StageUI created');

        this.createHeader();
    
        this.viewport =
            new StageViewport(this.scene, {
                x: 10,
                y: 60,
                width: this.width - 20,
                height: this.height - 140
            });
    
        this.navigation =
            new StageNavigation(this.scene, {
                x: 10,
                y: this.height - 70,
                width: this.width - 20,
                height: 60
            });

        this.scene.events.on(
            'stage-tab-changed',
            id => {
                this.changeTab(id);
            }
        );
        
        this.stage = stageData[0];
        this.changeTab('gather');
    }

    changeTab(id) {
        const cards = this.stage.tabs[id];
        if (!cards) return;
        this.viewport.showCards(cards);
    }

    createHeader() {

        // Temporary
        this.scene.add.text(
            10,
            10,
            'CELL STAGE',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
    }


    createViewport() {

        // Temporary
        this.scene.add.rectangle(
            10,
            60,
            this.width - 20,
            this.height - 140,
            0x111111
        )
        .setOrigin(0);
    }


    createNavigation() {

        // Temporary
        this.scene.add.rectangle(
            10,
            this.height - 70,
            this.width - 20,
            60,
            0x000055
        )
        .setOrigin(0);
    }
}