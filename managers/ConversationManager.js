export default class ConversationManager {

    constructor(scene) {
        this.scene = scene;

        this.active = false;
        this.conversation = null;
        this.index = 0;
    }

    start(conversation) {
        if (this.active) {
            return;
        }
    
        this.active = true;
        this.conversation = conversation;
        this.index = 0;
    
        this.scene.scene.pause(
            this.scene.scene.key
        );
    
        this.scene.scene.launch(
            'DialogScene',
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
    
        this.scene.scene
            .get('DialogScene')
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
    
        this.scene.scene.stop('DialogScene');
    
        this.scene.scene.resume(
            this.scene.scene.key
        );
    
        this.conversation = null;
        this.index = 0;
    }
}