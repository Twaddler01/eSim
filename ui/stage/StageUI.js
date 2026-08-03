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
        this.headerBox1();
        this.headerBox2();
        this.headerBox3();
    
        this.viewport =
            new StageViewport(this.scene, {
                x: 10,
                y: 100, // 60 (+40)
                width: this.width - 20,
                height: this.height - 180 // 140
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
        /*this.scene.add.rectangle(
            10,
            10,
            this.width - 20,
            90, // 50
            0xffffff
        )
        .setOrigin(0);*/

        this.scene.add.text(
            40,
            10,
            'CELL STAGE',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
    }

    // Messages here
    headerBox1() {
        this.headerBox1 = this.scene.add.rectangle(
            10,
            50,
            this.width / 3 - 7,
            40,
            0x444444
        )
        .setOrigin(0);
    }

    headerBox2() {
        this.headerBox2 = this.scene.add.rectangle(
            10 + this.headerBox1.width + 1,
            10,
            this.width / 3 - 7,
            80,
            0x444444
        )
        .setOrigin(0);
    }
    
    headerBox3() {
        this.scene.add.rectangle(
            10 + this.headerBox1.width + 1 + this.headerBox2.width + 1,
            10,
            this.width / 3 - 7,
            80,
            0x444444
        )
        .setOrigin(0);
    }
    

    createViewport() {

        // Temporary
        this.scene.add.rectangle(
            10,
            100, // 60
            this.width - 20,
            this.height - 180, // 140
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