import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { stageData, stageItems } from '../../data/stageData.js';
import { gameData } from '../../data/gameData.js';
import MessageStatus from './MessageStatus.js';
import StageProgressManager from '../../managers/StageProgressManager.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';

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

    // Create UI
    createUI() {
        this.stageProgress =
            new StageProgressManager(gameData);

        // Current stage
        this.stage = stageData[0];

        // Listen for changes
        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                update => {
                    this.updateAffectedCards(update.id);
                }
            );
        
        // For UI tab chsnges
        this.removeTabListener =
            listenToEvent(
                this.scene.events,
                'stage-tab-changed',
                id => {
                    this.changeTab(id);
                }
            );

        // Header
        this.createHeader();

        this.headerBox1();
        this.headerBox2();

        // Inventory
        this.inventory =
            new StageInventory(
                this.scene,
                this.stageProgress,
                stageItems,
                {
                    x: this.headerBox2.x,
                    y: this.headerBox2.y,
                    width: this.headerBox2.width,
                    height: this.headerBox2.height
                }
            );

        this.headerBox3();

        // Messages
        this.messageStatus =
            new MessageStatus(
                this.scene,
                this.scene.gameTimer,
                {
                    x: this.headerBox1.x - 1,
                    y: this.headerBox1.y,
                    width: this.headerBox1.width + 1,
                    height: this.headerBox1.height + 1,
                    fontSize: '18px',
                    fontColor: '#33FFE4'
                }
            );

        this.messageStatus.addMessageDelayed(
            'Welcome to eSim: Cell Stage!',
            2000
        );

        // Viewport
        const margin = 10;
        const navigationHeight = 60;
        const navigationY =
            this.height -
            navigationHeight -
            margin;
        const viewportY = 300;
        const viewportBottom =
            navigationY - 10;
        const viewportHeight =
            viewportBottom - viewportY;

        this.viewport =
            new StageViewport(
                this.scene,
                {
                    x: margin,
                    y: viewportY,
                    width:
                        this.width -
                        margin * 2,
                    height:
                        viewportHeight
                }
            );

        // Navigation
        this.navigation =
            new StageNavigation(
                this.scene,
                {
                    x: margin,
                    y: navigationY,
                    width:
                        this.width -
                        margin * 2,
                    height:
                        navigationHeight
                }
            );

        // Initial tab
        this.currentTab = 'gather';
        this.refreshCurrentTab();
    }

    // Change tab
    changeTab(id) {

        if (this.currentTab === id) {
            return;
        }

        this.currentTab = id;

        // Changing tabs DOES rebuild the cards.
        this.refreshCurrentTab();
    }

    // Header
    createHeader() {

        this.scene.add.rectangle(
            10,
            10,
            this.width / 3 - 10,
            40,
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

    headerBox1() {
        this.headerBox1 =
            this.scene.add.rectangle(
                10,
                50,
                this.width / 3 - 9,
                this.headerHeight -
                    this.headerTitleHeight,
                0x444444
            )
            .setOrigin(0)
            .setVisible(false);
    }

    headerBox2() {
        this.headerBox2 =
            this.scene.add.rectangle(
                10 + this.headerBox1.width + 1,
                10,
                this.width / 3 - 8,
                this.headerHeight,
                0x444444
            )
            .setOrigin(0)
            .setVisible(false);
    }

    headerBox3() {
        this.headerBox3 =
            this.scene.add.rectangle(
                10 +
                    this.headerBox1.width +
                    1 +
                    this.headerBox2.width +
                    1,
                10,
                this.width / 3 - 7,
                this.headerHeight,
                0x444444
            )
            .setOrigin(0);
    }

    // Gather
    gather(item) {
        const current =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (current >= max) {
            return;
        }
    
        const gatherAmount =
            this.getGatherAmount(item);
    
        const newAmount =
            Math.min(
                current + gatherAmount,
                max
            );
    
        this.stageProgress.set(
            item.id,
            newAmount
        );
    
        this.checkGatherUpgrade(item);
    }

    getGatherLevel(item) {
        return this.stageProgress.getGatherLevel(item.id);
    }
    
    getGatherAmount(item) {
        const baseAmount = 1;
    
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade?.enabled) {
            return baseAmount;
        }
    
        const level =
            this.getGatherLevel(item);
    
        return (
            baseAmount +
            level * upgrade.rateIncrease
        );
    }
    
    checkGatherUpgrade(item) {
        const upgrade =
            item.gather?.upgrade;
    
        if (!upgrade?.enabled) {
            return;
        }
    
        const current =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (current < max) {
            return;
        }
    
        // Reset amount
        this.stageProgress.set(
            item.id,
            0
        );
    
        // Increase upgrade level
        this.stageProgress.addGatherLevel(
            item.id,
            1
        );
    }

    // Create
    create(item) {
        const requirements =
            item.requirements ?? {};

        const canCreate =
            Object.entries(requirements)
                .every(([id, required]) => {

                    const amount =
                        this.stageProgress.get(id);

                    return amount >= required;
                });


        if (!canCreate) {
            return;
        }


        // Consume
        Object.entries(requirements)
            .forEach(([id, amount]) => {

                this.stageProgress.add(
                    id,
                    -amount
                );
            });


        // Produce
        Object.entries(item.produces ?? {})
            .forEach(([id, amount]) => {

                this.stageProgress.add(
                    id,
                    amount
                );
            });
    }

    // Availability
    getAvailability(item) {
    
        if (!item.unlocked) {
            return 'locked';
        }
    
        const amount =
            this.stageProgress.get(item.id);
    
        const max =
            getItemMax(item, this.stageProgress);
    
        if (
            max != null &&
            amount >= max
        ) {
            return 'maxed';
        }
    
        const requirementsMet =
            Object.entries(item.requirements ?? {})
                .every(([id, required]) => {
    
                    const current =
                        this.stageProgress.get(id);
    
                    return current >= required;
                });
    
        if (!requirementsMet) {
            return 'insufficient';
        }
    
        return 'available';
    }

    // Build cards for current tab
    refreshCurrentTab() {
        const cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );

        const displayCards = cards.map(item => ({
        
            ...item,
        
            type: this.currentTab,
        
            amount:
                this.stageProgress.get(item.id),
        
            max:
                getItemMax(item, this.stageProgress),
        
            availability:
                this.getAvailability(item),
        
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

    // Update only affected cards
    updateAffectedCards(id) {
        const cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );
    
        cards.forEach(item => {
            const affectsAmount =
                item.id === id;
    
            const affectsRequirement =
                Object.keys(
                    item.requirements ?? {}
                ).includes(id);
    
            if (
                affectsAmount ||
                affectsRequirement
            ) {
    
                const max =
                    item.tab === 'gather'
                        ? getItemMax(
                            item,
                            this.stageProgress
                        )
                        : item.max;
    
                this.viewport.updateCard(
                    item.id,
                    {
                        amount:
                            this.stageProgress.get(
                                item.id
                            ),
    
                        max,
    
                        availability:
                            this.getAvailability(
                                item
                            )
                    }
                );
            }
        });
    }

    updateGatherUpgradeCard(id) {
        const item =
            stageItems.find(
                item =>
                    item.id === id
            );
    
        if (!item) return;
    
        // Only relevant if this item is
        // currently displayed.
        if (
            item.tab !== this.currentTab
        ) {
            return;
        }
    
        this.viewport.updateCard(
            item.id,
            {
                amount:
                    this.stageProgress.get(
                        item.id
                    ),
    
                max:
                    getItemMax(
                        item,
                        this.stageProgress
                    ),
    
                availability:
                    this.getAvailability(item)
            }
        );
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
        this.removeTabListener?.();;

        this.inventory?.destroy();
        this.viewport?.destroy();
        this.navigation?.destroy();
        this.messageStatus?.destroy();

        this.stageProgress?.destroy();
    }
}