import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { subTabs, stageItems } from '../../data/stageData.js';
import MessageStatus from './MessageStatus.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import DebugButtons from '../../debug/DebugButtons.js';
import { DEBUG } from '../../config.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';
import StageSubNavigation from './StageSubNavigation.js';
import * as df from '../../data/dataFunctions.js';

export default class StageUI {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.autoGather = this.scene.autoGather;
        this.stageProgress = this.scene.stageProgress;

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
            'unlock',
            'gather-auto-upgrade'
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

    // Get cards (for tabs)
    refreshCurrentTab() {
        const cardData =
            df.getCurrentTabCardData(
                this.currentTab,
                this.currentSubTab,
                this.stageProgress,
                this.autoGather,
                stageItems
            );
    
        this.viewport.showCards(cardData);
    }

    updateCurrentTab() {
        const cardData =
            df.getCurrentTabCardData(
                this.currentTab,
                this.currentSubTab,
                this.stageProgress,
                this.autoGather,
                stageItems
            );
    
        this.viewport.syncCards(cardData);
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