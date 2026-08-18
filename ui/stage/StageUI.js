import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import { stageData, stageItems, stageObjectives } from '../../data/stageData.js';
import { gameData } from '../../data/gameData.js';
import MessageStatus from './MessageStatus.js';
import StageProgressManager from '../../managers/StageProgressManager.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';

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
            new StageProgressManager(gameData, stageData, stageItems, stageObjectives); // temp masterObjectives

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
        const viewportY = 300;
        const viewportBottom =
            navigationY - 10;
        const viewportHeight =
            viewportBottom - viewportY;

        // Initial tab
        this.currentTab = 'create'; // gather

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
                        viewportHeight,
                    tab: this.tab
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

        // DISCOVERY TRACKER
        this.discoveryTracker =
            new StageDiscoveryTracker(this.scene, this.stageProgress, {
                    x: 10 + this.headerBoxWidth + 1 + this.width / 3 - 8 + 1,
                    y: 10 + this.headerTitleHeight + 1,
                    width: this.width / 3 - 7,
                    height: this.headerHeight - this.headerTitleHeight - 1
                }
            );
// TEST
//this.stageProgress.unlock('darkness');
//console.log(this.stageProgress.getUnlocked('darkness'));

// TEST
const unlockTest = stageItems.filter(i => i.tab === 'create');
unlockTest.forEach(item => {
    this.stageProgress.unlock(item.id);
});

        this.refreshCurrentTab();
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

    // Get cards (for tab initialization)
    getCurrentTabCardData() {
        let cards =
            stageItems.filter(
                item =>
                    item.tab === this.currentTab
            );
    
        // OBJECTIVES
        if (this.currentTab === 'discover') {
    
            const objectives =
                this.stageProgress
                    .getSortedCurrentObjectives();
    
            const objectiveCards =
                objectives.map(
                    objective =>
                        this.getObjectiveCardData(
                            objective
                        )
                );
    
            cards = [
                ...objectiveCards,
                ...cards
            ];
        }

        return cards.map(item => ({
    
            ...item,
    
            amount:
                item.discovery
                    ? null
                    : this.stageProgress.get(item.id),
    
            max:
                item.discovery
                    ? null
                    : getItemMax(
                        item,
                        this.stageProgress
                    ),
    
            nextMax:
                item.gather
                    ? getItemMax(
                        item,
                        this.stageProgress,
                        'next'
                    )
                    : null,
    
            upgradeStats:
                this.getUpgrades(item),
    
            availability:
                this.getAvailability(item),
    
            getAmount:
                id =>
                    this.stageProgress.get(id),
                    
            createRequirements: item.tab === 'create' ? this.stageProgress.getCreateRequirements(item) : null,
                    
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
        const cardData =
            this.getCurrentTabCardData();
    
        this.viewport.showCards(
            cardData
        );
    }

    // SAME TAB REFRESH
    // Keep the existing cards and reconcile them with the new state
    updateCurrentTab() {
        const cardData =
            this.getCurrentTabCardData();
    
        this.viewport.syncCards(
            cardData
        );
    }

    // Helpers for getCurrentTabCardData()
    getObjectiveCardData(objective) {
        const card = {
            ...objective,
    
            objective: true,
            // For stageItems data (title)
            reqItems: this.stageProgress.getReqItems(objective.id),
            
            // WIP later??
            //unlocksItems: this.stageProgress.objectiveUnlockList(objective),

            amount: null,
            max: null,
            
            tab: this.stageProgress.getTabId(objective.id),
    
            availability:
                this.stageProgress.getObjectiveStatus(
                    objective.id
                )
        };

        if (objective.type === 'parent') {
            const progress =
                this.stageProgress.getParentProgress(
                    objective.id
                );
    
            card.amount = progress.completed;
            card.max = progress.total;
            card.percent = progress.percent;
    
            card.children =
                (objective.children ?? [])
                    .map(childId =>
                        stageObjectives.find(
                            child => child.id === childId
                        )
                    )
                    .filter(Boolean);
    
            card.getChildComplete =
                childId =>
                    this.stageProgress.isObjectiveComplete(childId);
        }
        return card;
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

    // this.gather
    gather(item) {
        const current =
            this.stageProgress.get(item.id);
    
        const upgradeStats =
            this.getUpgrades(item);
    
        const max =
            upgradeStats.current_max;
    
        const gatherAmount =
            this.getGatherAmount(item);
    
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

    getGatherLevel(item) {
        return this.stageProgress.getGatherLevel(item.id);
    }
    
    getGatherAmount(item) {
        const baseAmount = 1;
    
        const upgrade =
            item.gather?.upgrade;
    
        if (
            !upgrade ||
            upgrade.enabled === false ||
            (upgrade.rateIncrease ?? 0) <= 0
        ) {
            return baseAmount;
        }
    
        const level =
            this.getGatherLevel(item);
    
        return (
            baseAmount +
            level * upgrade.rateIncrease
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
    // Objectives
        if (item.objective) {
            return this.stageProgress.getObjectiveStatus(
                item.id
            );
        }

        const unlocked =
            item.startsUnlocked ||
            this.stageProgress.getUnlocked(item.id);

        if (!unlocked) {
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

        return 'active';
    }

    getUpgrades(item) {
        return this.stageProgress.getGatherUpgradeStats(
            item.id,
            item
        );
    }
    
    getCardCanAction(item) {
        if (item.objective) {
            return (
                this.stageProgress.getObjectiveStatus(item.id) === 'active'
            );
        }

        return this.getAvailability(item) === 'active';
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
    
        // Objectives
        if (this.currentTab === 'discover') {
            if (item.objective) {
                this.completeObjective(item.id);
                return;
            }
        }
    }
    
    completeObjective(id) {
        const success =
            this.stageProgress.completeObjective(id);
    
        if (!success) {
            return;
        }
    
        this.refreshCurrentTab();
    }

    updateAffectedCards(update) {
        // Objective changes can add/remove/reorder
        // cards and change parent progress.
        if (
            update.type === 'objective-unlock' ||
            update.type === 'objective-complete'
        ) {
            this.refreshCurrentTab();
            return;
        }
    
        // Amount changes can change requirements,
        // availability, progress, etc.
        if (
            update.type === 'amount' ||
            update.type === 'gather-upgrade'
        ) {
            this.updateCurrentTab();
            return;
        }
    }

    getObjectiveComplete(id) {
        return this.stageProgress.isObjectiveComplete(id);
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