import StageUI from '../ui/stage/StageUI.js';
import { gameData } from '../data/gameData.js';
import { stageData, stageItems, stageObjectives } from '../data/stageData.js';
import AutoGatherManager from '../managers/AutoGatherManager.js';
import StageProgressManager from '../managers/StageProgressManager.js';
import ConversationManager from '../managers/ConversationManager.js';
import { conversationData } from '../data/conversationData.js';
import AnnouncementManager from '../managers/AnnouncementManager.js';
import { announcementData } from '../data/announcementData.js';
import ObjectivesManager from '../managers/ObjectivesManager.js';
import StageProgressState from '../managers/StageProgressState.js';
import ObjectiveFlow from '../managers/ObjectiveFlow.js';
import { flowData } from '../data/flowData.js';

export default class CreationScene extends Phaser.Scene {

    constructor() {
        super('CreationScene');
        this.scene = this.game;
        this.gameData = gameData;
        this.stageObjectives = stageObjectives;
        this.flowData = flowData;
        this.announcementData = announcementData;
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
            new StageProgressManager(this.gameData, stageData, stageItems, this.stageObjectives, this.stageProgressState);

        this.objectivesManager  =
            new ObjectivesManager(this.stageProgress, this.stageProgressState);

        /*this.objectivesManager.on(
            'updated',
            data => {
                if (data.type === 'objective-complete') {
                    this.handleObjectiveComplete(data);
                }
        
            }
        );*/

        this.announcementManager =
            new AnnouncementManager(this, {
                    announcementData: this.announcementData,
                }
            );

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
                }
            );

        this.autoGather =
            new AutoGatherManager(
                (itemId, autoAmt) => this.stageProgress.handleAutoGather(itemId, autoAmt)
            );
        this.syncAutoGather();

        this.stageUI = new StageUI(this);

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }
/*
    handleObjectiveComplete(data) {
    
        const triggers =
            data.objective.triggers;
    
        // Announcement
        if (triggers?.announcements) {
    
            const announcements =
                triggers?.announcements ?? [];
            
            announcements.forEach(trigger => {
            
                const announcement =
                    announcementData[trigger.id];
            
                if (!announcement) {
                    return;
                }
            
                this.time.delayedCall(
                    trigger.delay ?? 0,
                    () => {
                        this.announcementManager.show(
                            announcement
                        );
                    }
                );
            });
        }
    
        // Conversation
        if (triggers?.conversation) {
    
            const conversation =
                conversationData[
                    triggers.conversation.id
                ];
    
            this.time.delayedCall(
                triggers.conversation.delay ?? 0,
                () => {
                    this.conversationManager.start(
                        conversation
                    );
                }
            );
        }
    }
*/
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

    // DEBUGGING
    convoTest() {
        this.time.delayedCall(5000, () => {
            this.conversationManager.start(
                conversations.creation_intro
            );
        });
    }

    update(time, delta) {
        this.gameTimer.update(delta);
        this.autoGather.update(delta);
    }

    shutdown() {
        this.stageUI?.destroy();
    }
}