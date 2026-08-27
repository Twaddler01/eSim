import StageUI from '../ui/stage/StageUI.js';
import { gameData } from '../data/gameData.js';
import { stageData, stageItems, stageObjectives } from '../data/stageData.js';
import AutoGatherManager from '../managers/AutoGatherManager.js';
import StageProgressManager from '../managers/StageProgressManager.js';
import ConversationManager from '../managers/ConversationManager.js';
import { conversations } from '../data/conversationData.js';
    
export default class CreationScene extends Phaser.Scene {

    constructor() {
        super('CreationScene');
        this.scene = this.game;

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

        this.stageProgress =
            new StageProgressManager(gameData, stageData, stageItems, stageObjectives);

        this.stageProgress.on(
            'updated',
            data => {
                if (data.type === 'objective-complete') {
                    this.handleObjectiveComplete(data);
                }
        
            }
        );

        this.conversationManager =
            new ConversationManager(this);

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

    handleObjectiveComplete(data) {
        const objective = data.objective;
        const conversation = objective.triggers?.conversation;

        if (!conversation) {
            return;
        }
    
        const delay = conversation.delay ?? 0;
    
        this.time.delayedCall(
            delay,
            () => {
                this.conversationManager.start(
                    conversations[conversation.id]
                );
            }
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