import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { stageData, stageItems } from '../../data/stageData.js';
import { gameData } from '../../data/gameData.js';
import MessageStatus from './MessageStatus.js';
import StageProgressManager from '../../managers/StageProgressManager.js';
import StageInventory from './StageInventory.js';

export default class StageUI {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.width =
            options.width ??
            scene.scale.width;

        this.height =
            options.height ??
            scene.scale.height;

        this.headerHeight = 280;
        this.headerTitleHeight = 40;

        this.createUI();

    }

    createUI() {
        this.stageProgress = new StageProgressManager(gameData);

        this.stage = stageData[0];

        this.createHeader();
        this.headerBox1();
        this.headerBox2();
        
        this.inventory = new StageInventory(this.scene, this.stageProgress, stageItems, {
            x: this.headerBox2.x,
            y: this.headerBox2.y,
            width: this.headerBox2.width,
            height: this.headerBox2.height
        });

        this.headerBox3();
        
        // For messages
        this.messageStatus = new MessageStatus(
            this.scene, this.scene.gameTimer, {
            x: this.headerBox1.x,
            y: this.headerBox1.y,
            width: this.headerBox1.width,
            height: this.headerBox1.height,
            fontSize: '18px',
            fontColor: '#33FFE4'
        });
        
        this.messageStatus.addMessageDelayed('Wecome to eSim: Cell Stage!', 2000);

        const margin = 10;
        const navigationHeight = 60;
        const navigationY = this.height - navigationHeight - margin;
        
        const viewportY = 300;
        const viewportBottom = navigationY - 10;
        
        const viewportHeight = viewportBottom - viewportY;
        
        this.viewport =
            new StageViewport(this.scene, {
                x: margin,
                y: viewportY,
                width: this.width - margin * 2,
                height: viewportHeight,
            });
        
        this.navigation =
            new StageNavigation(this.scene, {
                x: margin,
                y: navigationY,
                width: this.width - margin * 2,
                height: navigationHeight,
            });

        this.scene.events.on(
            'stage-tab-changed',
            id => {
                this.changeTab(id);
            }
        );
        
        this.currentTab = 'gather';
        this.refreshCurrentTab();
    }

    changeTab(id) {
        this.currentTab = id;
        this.refreshCurrentTab();
    }

    createHeader() {
        this.scene.add.rectangle(
            10,
            10,
            this.width - 20,
            90, // 50
            0x000055
        )
        .setOrigin(0);
        
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
            this.headerHeight - this.headerTitleHeight,
            0x444444
        )
        .setOrigin(0);
    }

    headerBox2() {
        this.headerBox2 = this.scene.add.rectangle(
            10 + this.headerBox1.width + 1,
            10,
            this.width / 3 - 7,
            this.headerHeight,
            0x444444
        )
        .setOrigin(0);
    }
    
    headerBox3() {
        this.scene.add.rectangle(
            10 + this.headerBox1.width + 1 + this.headerBox2.width + 1,
            10,
            this.width / 3 - 7,
            this.headerHeight,
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
    
    gather(item) {
        const current = this.stageProgress.get(item.id);
    
        if (current >= item.max) {
            return;
        }
    
        const newAmount = this.stageProgress.add(item.id, 1);
    
        //console.log(`${item.title}: ${newAmount}`);
    
        this.refreshCurrentTab();
    }
    
    create(item) {
        console.log('Attempting to create:');
        console.log(item.id);
    
        // Check requirements
        const canCreate =
            Object.entries(item.requirements)
                .every(([id, required]) => {
                    const amount =
                        this.stageProgress.get(id);
                    return amount >= required;
                });
    
        if (!canCreate) {
            console.log('Not enough materials.');
            return;
        }
    
        // Consume materials
        Object.entries(item.requirements)
            .forEach(([id, amount]) => {
                this.stageProgress.add(
                    id,
                    -amount
                );
            });
    
        // Produce result
        Object.entries(item.produces)
            .forEach(([id, amount]) => {
                this.stageProgress.add(
                    id,
                    amount
                );
            });
    
        console.log(`Created ${item.title}`);
        // Refresh cards
        this.refreshCurrentTab();
    }

getAvailability(item) {

    // Completely unavailable
    if (!item.unlocked) {
        return 'locked';
    }

    const amount =
        this.stageProgress.get(item.id);

    // Already at maximum
    if (amount >= item.max) {
        return 'maxed';
    }

    // Check requirements
    const requirementsMet =
        Object.entries(item.requirements ?? {})
            .every(([id, required]) => {

                const current =
                    this.stageProgress.get(id);

                return current >= required;
            });

    // Unlocked, but missing materials
    if (!requirementsMet) {
        return 'insufficient';
    }

    return 'available';
}

    refreshCurrentTab() {
    
        const cards = stageItems.filter(item => item.tab === this.currentTab);
    
        if (!cards) return;
    
        const displayCards = cards
            .map(item => ({
        
                ...item,
                
                type: this.currentTab,
        
                amount:
                    this.stageProgress.get(item.id),
                    
                availability: this.getAvailability(item),
        
                getAmount: id => {
        
                    return this.stageProgress.get(id);
        
                },
        
                canAction: () =>
                    this.getAvailability(item) === 'available',
        
                onAction: () => {
        
                    if (this.currentTab === 'gather') {
        
                        this.gather(item);
        
                    }
        
                    if (this.currentTab === 'create') {
        
                        this.create(item);
        
                    }
        
                }
        
        }));
    
        this.viewport.showCards(
            displayCards
        );
    }
    
    destroy() {
/*
WIP:
this.messageStatus?.destroy();
this.stageProgress?.destroy();
*/
        this.viewport?.destroy();
        this.navigation?.destroy();
    }
}