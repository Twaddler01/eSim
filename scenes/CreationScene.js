import DebugButtons from '../debug/DebugButtons.js';
import { DEBUG } from '../config.js';
import StageUI from '../ui/stage/StageUI.js';
import { gameData } from '../data/gameData.js';

// OLD
import { stageData, stageItems, stageObjectives } from '../data/stageData.js';
// NEW
import { 
    gatherCards, 
    createItemsCards,
    createUpgradesCards,
    discoverCards
} from '../data/stageData.js';

import AutoGatherManager from '../managers/AutoGatherManager.js';
import StageProgressManager from '../managers/StageProgressManager.js';
import ConversationManager from '../managers/ConversationManager.js';
import AnnouncementManager from '../managers/AnnouncementManager.js';
import ObjectivesManager from '../managers/ObjectivesManager.js';
import StageProgressState from '../managers/StageProgressState.js';
import ObjectiveFlow from '../managers/ObjectiveFlow.js';
import { flowData, conversationData } from '../data/flowData.js';

export default class CreationScene extends Phaser.Scene {

    constructor() {
        super('CreationScene');
        this.scene = this.game;
        this.gameData = gameData;
        this.stageObjectives = stageObjectives;
        this.flowData = flowData;
        this.conversationData = conversationData;

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

        this.stageProgressState =
            new StageProgressState(this.gameData);

        this.stageProgress =
            new StageProgressManager(this.stageProgressState, {
                    gameData: this.gameData, 
                    stageData: stageData, 
                    stageItems: stageItems, 
                    stageObjectives: this.stageObjectives, 
                    // NEW
                    gatherCards, 
                    createItemsCards,
                    createUpgradesCards,
                    discoverCards
                }
            );

        this.objectivesManager  =
            new ObjectivesManager(this.stageProgress, this.stageProgressState);

        this.announcementManager =
            new AnnouncementManager(this, {});

        this.conversationManager =
            new ConversationManager(this, {
                    conversationData: this.conversationData
                }
            );

        this.objectiveFlow =
            new ObjectiveFlow(this, {
                objectivesManager: this.objectivesManager,
                flowData: this.flowData,
                announcementManager: this.announcementManager,
                conversationManager: this.conversationManager
            });

        this.autoGather =
            new AutoGatherManager(
                (itemId, autoAmt) => this.stageProgress.handleAutoGather(itemId, autoAmt)
            );
        this.syncAutoGather();

//// Debugging
if (DEBUG) {
    this.debugButtons = 
        new DebugButtons(this);
}
////

        this.stageUI = new StageUI(this);

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }

    syncAutoGather() {
        this.autoGather.clear();
        for (const item of this.stageProgress.getGatherItems()) {
            const autoAmt =
                this.stageProgress.getAutoGatherAmount(
                    item.id
                );
            if (autoAmt <= 0) {
                continue;
            }
            this.autoGather.setActive(
                item.id,
                autoAmt
            );
        }
    }

    update(time, delta) {
        this.gameTimer.update(delta);
        this.autoGather.update(delta);
    }

    shutdown() {
        this.stageUI?.destroy();
    }
}