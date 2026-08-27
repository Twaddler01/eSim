export default class ConversationManager {

    constructor(scene) {
        this.scene = scene;

        this.active = false;
        this.conversation = null;
        this.index = 0;

        this.events =
            new Phaser.Events.EventEmitter();
    }

    start(conversation) {
        if (this.active) {
            return;
        }
    
        this.active = true;
        this.conversation = conversation;
        this.index = 0;

        // Trigger a MessageStatus update 
        this.events.emit(
                'message',
                this.getCurrentMessage()
            );

        this.scene.scene.pause(
            this.scene.scene.key
        );
    
        this.scene.scene.launch(
            'ConversationScene',
            {
                manager: this
            }
        );
    }

    getCurrentMessage() {
        return this.conversation?.messages[this.index]
            ?? null;
    }

    next() {
        if (!this.active) {
            return;
        }
    
        this.index++;
    
        if (
            this.index >=
            this.conversation.messages.length
        ) {
            this.finish();
            return;
        }

        const message =
            this.getCurrentMessage();
        
            this.events.emit(
                'message',
                message
            );

        this.scene.scene
            .get('ConversationScene')
            .showCurrent();
    }

    cancel() {
        this.finish();
    }

    isLastMessage() {
        return this.index ===
            this.conversation.messages.length - 1;
    }

    finish() {
        this.active = false;
    
        this.scene.scene.stop('ConversationScene');
    
        this.scene.scene.resume(
            this.scene.scene.key
        );
    
        this.conversation = null;
        this.index = 0;
    }
}