import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { subTabs, stageData, stageItems, stageObjectives } from '../../data/stageData.js';
import { gameData } from '../../data/gameData.js';
import MessageStatus from './MessageStatus.js';
import StageProgressManager from '../../managers/StageProgressManager.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import DebugButtons from '../../debug/DebugButtons.js';
import { DEBUG } from '../../config.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';
import StageSubNavigation from './StageSubNavigation.js';

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
        
        this.headerBoxX = 10;
        this.headerBoxY = 10;
        this.belowHeaderY = 50;
        this.headerBoxWidth = this.width / 3 - 8;
        this.headerBoxHeight = this.headerHeight - this.headerTitleHeight;

        this.createUI();
    }

    // Create UI
    createUI() {
        this.stageProgress =
            new StageProgressManager(gameData, stageData, stageItems, stageObjectives);

        // Set current stage
        this.stageTitle = this.stageProgress.setStage('creation');

        // Header
        this.createHeader();

        // Listen for changes
        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                update => {
                    this.updateAffectedCards(update);
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
            
        this.removeSubTabListener =
            listenToEvent(
                this.scene.events,
                'stage-sub-tab-changed',
                id => {
                    this.changeSubTab(id);
                }
            );

        // Inventory
        this.inventory =
            new StageInventory(
                this.scene,
                this.stageProgress,
                stageItems,
                {
                    x: this.headerBoxX + this.headerBoxWidth + 1,
                    y: this.belowHeaderY + 1,
                    width: this.headerBoxWidth,
                    height: this.headerHeight - this.headerTitleHeight - 1,
                }
            );

        // Messages
        this.messageStatus =
            new MessageStatus(
                this.scene,
                this.scene.gameTimer,
                {
                    x: this.headerBoxX,
                    y: this.belowHeaderY,
                    width: this.headerBoxWidth,
                    height: this.headerHeight - this.headerTitleHeight + 1,
                    fontSize: '18px',
                    fontColor: '#33FFE4'
                }
            );

        this.messageStatus.addMessageDelayed(
            'Welcome to eSim: Creation Stage!',
            2000
        );

        // Viewport
        const margin = 10;
        const navigationHeight = 60;
        const navigationY =
            this.height -
            navigationHeight -
            margin;
            
        //const viewportY = 380; // - 60 on sub
        this.contentBottomTab = 380;
        this.contentBottomSub = 320;
        
        const viewportBottom =
            navigationY - 10;
        const viewportHeight =
            viewportBottom - this.contentBottomTab;
        
        // Header for cards
        this.createCardHeader(margin, this.contentBottomTab);

        // Initial tab
        this.currentTab = 'gather'; // gather
        // Initial sub Tab
        this.currentSubTab = this.getDefaultSubTab();

        this.viewport =
            new StageViewport(
                this.scene,
                {
                    x: margin + 6,
                    y: this.contentBottomTab,
                    width:
                        this.width -
                        margin * 2 - 5,
                    height:
                        viewportHeight,
                    tab: this.currentTab
                }
            );

        // Sub tabs class
        const subNavigationY = navigationY - navigationHeight;
        this.subNavigation =
            new StageSubNavigation(
                this.scene,
                {
                    x: margin,
                    y: subNavigationY,
                    width: this.width - margin * 2,
                    height: 50,
                    tabs: this.getSubTabs() ?? []
                }
            );
        // Initial sub tab
        this.subNavigation.setActiveTab(this.currentSubTab);

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
        this.navigation.setActiveTab(this.currentTab);

        // DISCOVERY TRACKER
        this.discoveryTracker =
            new StageDiscoveryTracker(this.scene, this.stageProgress, {
                    x: 10 + this.headerBoxWidth + 1 + this.width / 3 - 8 + 1,
                    y: 10 + this.headerTitleHeight + 1,
                    width: this.width / 3 - 7,
                    height: this.headerHeight - this.headerTitleHeight - 1
                }
            );

        this.refreshCurrentTab();

//// Debugging
if (DEBUG) {
    this.debugButtons = 
        new DebugButtons(this.scene, this.stageProgress);
}
////
    }

    // Header
    createHeader() {
        this.scene.add.rectangle(
            this.headerBoxX,
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        this.stageTitleText = addText(this.scene,
            20,
            10,
            this.stageTitle, // setStage() adds title
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
        
        this.scene.add.rectangle(
            this.headerBoxX + this.headerBoxWidth + 1,
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        addText(this.scene,
            this.headerBoxX + this.headerBoxWidth + 80,
            this.headerTitleHeight / 2 - 2,
            'INVENTORY',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        
        this.scene.add.rectangle(
            this.headerBoxX + ((this.headerBoxWidth + 1)*2),
            this.headerBoxY,
            this.headerBoxWidth,
            this.headerTitleHeight,
            0x000055
        )
        .setOrigin(0);

        addText(this.scene,
            this.headerBoxX + (this.headerBoxWidth + 1) * 2 + 40,
            this.headerTitleHeight / 2 - 2,
            'DISCOVERY TRACKER',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        );
    }

    createCardHeader(startX, startY) {
        const padding = 10;
        this.scene.add.rectangle(
            startX + 6,
            startY - 80,
            this.width - padding * 2 - 6,
            80 - padding,
            0x444444
        )
        .setOrigin(0);
    }

    // Dynamic viewport
    updateViewportLayout() {
        const viewportY =
            this.contentBottomTab;
    
        const viewportBottom =
            this.hasSubNavigation()
                ? this.subNavigation.y - 10
                : this.navigation.y - 10;
    
        const height =
            viewportBottom - viewportY;
    
        this.viewport.setBounds(
            viewportY,
            height
        );
    }
    
    // Helper ^
    hasSubNavigation() {
        return this.subNavigation?.container.visible === true;
    }

//--------------------------------
// Listener updates
//--------------------------------
    updateAffectedCards(update) {
        const updateTypes = [
            'amount',
            'gather-upgrade',
            'objective-unlock',
            'objective-complete',
            'unlock'
        ];
    
        if (updateTypes.includes(update.type)) {
            this.updateCurrentTab();
            return;
        }
    
        const refreshTypes = [
            // 'stage-change',
            // 'change-card-definition',
        ];
    
        if (refreshTypes.includes(update.type)) {
            this.refreshCurrentTab();
        }
    }

    // Change tab
    changeTab(id) {

        if (this.currentTab === id) {
            return;
        }

        this.currentTab = id;
        
        // Reset to the first sub-tab for this main tab
        this.currentSubTab =
            this.getDefaultSubTab();
        
        // Clear sub tabs
        this.subNavigation.setTabs(
            this.getSubTabs() ?? []
        );
        
        this.subNavigation.setActiveTab(
            this.currentSubTab
        );
        
        // WIP
        this.updateViewportLayout();

        // Changing tabs DOES rebuild the cards.
        this.refreshCurrentTab();
    }

    // Sub Tabs
    getSubTabs() {
        return subTabs[this.currentTab] ?? null;
    }
    
    getDefaultSubTab() {
        const tabs = this.getSubTabs();
        return tabs?.[0]?.id ?? null;
    }
    
    changeSubTab(id) {
        if (this.currentSubTab === id) {
            return;
        }
    
        this.currentSubTab = id;
    
        this.refreshCurrentTab();
    }

//--------------------------------
// CARDS
//--------------------------------

    // Get cards (for tab initialization)
    getCurrentTabCardData() {
        // CREATE sub-tab
        if (
            this.currentTab === 'create' &&
            this.currentSubTab === 'upgrades'
        ) {
            return [];
        }
        
        let cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );
    
        // OBJECTIVES
        if (this.currentTab === 'discover') {
            
            // Modified array structure 
            const objectiveCards =
                this.stageProgress
                    .getObjectiveData();
            
            cards = [
                ...objectiveCards,
                ...cards
            ];
        }

        return cards.map(item => ({
    
            ...item,
    
            amount:
                this.stageProgress.get(item.id),
    
            max:
                getItemMax(
                    item,
                    this.stageProgress
                ),
    
            nextMax:
                getItemMax(
                        item,
                        this.stageProgress,
                        'next'
                    ),
    
            upgradeStats:
                this.stageProgress.getGatherUpgradeStats(item.id, item),
    
            availability:
                this.stageProgress.getAvailability(item, item.tab),

            getCreateData: item.tab === 'create'
                ? () =>
                    this.stageProgress.getCreateData(item) : null,

            canUpgrade:
                () =>
                    this.stageProgress.gatherUpgradeAvailable(item),
            
            onUpgrade:
                () =>
                    this.stageProgress.upgradeGather(item),
    
            canAction:
                () =>
                    this.getCardCanAction(item),
    
            onAction:
                () =>
                    this.handleCardAction(item)
    
        }));
    }

    // DIFFERENT TAB REFRESH
    // Destroy old tab and build new tab
    refreshCurrentTab() {
        let cardData =
            this.getCurrentTabCardData();
        
        if (this.currentTab === 'gather') {
            const gatherData = cardData.filter(c => c.tab === 'gather');
            cardData = this.getGatherData(gatherData);
        }
    
        this.viewport.showCards(
            cardData
        );
    }

    // SAME TAB REFRESH
    // Keep the existing cards and reconcile them with the new state
    updateCurrentTab() {
        let cardData =
            this.getCurrentTabCardData();
        
        if (this.currentTab === 'gather') {
            const gatherData = cardData.filter(c => c.tab === 'gather');
            cardData = this.getGatherData(gatherData);
        }
    
        this.viewport.syncCards(
            cardData
        );
    }

    // Helper ^
    sortByAvailability(data, order) {
        return data.sort(
            (a, b) =>
                (order[a.availability] ?? 999) -
                (order[b.availability] ?? 999)
        );
    }

    // For updateCurrentTab() ^
    getGatherData(gatherData) {
        const data = gatherData;
            data.map(item => ({
                ...item,
                availability:
                    this.stageProgress.getAvailability(item, 'gather')
            }));
    
        return this.sortByAvailability(
            data,
            {
                active: 0,
                insufficient: 0,
                maxed: 0,
                locked: 1
            }
        );
    }

    //ggg this.gather
    gather(item) {
        const current =
            this.stageProgress.get(item.id);
    
        const upgradeStats =
            this.stageProgress.getGatherUpgradeStats(item.id, item);
    
        const max =
            upgradeStats.current_max;
    
        const gatherAmount =
            this.stageProgress.getGatherAmount(item);
    
        const newAmount =
            max == null
                ? current + gatherAmount
                : Math.min(
                    current + gatherAmount,
                    max
                );
    
        this.stageProgress.set(
            item.id,
            newAmount
        );
        
        this.stageProgress.gatherUpgradeAvailable(item);
    }
    
    //ccc Create
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

                // If produced item triggers requirements
                if (!this.stageProgress.getUnlocked(id)) {
                    this.stageProgress.unlock(id);
                }

                this.stageProgress.add(
                    id,
                    amount
                );
            });
    }

    getCardCanAction(item) {
        return this.stageProgress.getAvailability(item, item.tab) === 'active';
    }
    
    handleCardAction(item) {
        // Gather
        if (this.currentTab === 'gather') {
            this.gather(item);
        }
    
        // Create
        if (this.currentTab === 'create') {
            this.create(item);
            return;
        }
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
        this.removeTabListener?.();

        this.inventory?.destroy();
        this.viewport?.destroy();
        this.navigation?.destroy();
        this.messageStatus?.destroy();

        this.stageProgress?.destroy();
    }
}