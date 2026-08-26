import ConversationOverlay from '../ui/conversation/ConversationOverlay.js';

export default class DialogScene extends Phaser.Scene {

    constructor() {
        super('DialogScene');
    }

    create(data) {
        this.manager = data.manager;

        this.overlay =
            new ConversationOverlay(
                this,
                {
                    onNext: () => this.manager.next(),
                    onCancel: () => this.manager.cancel()
                }
            );

        this.showCurrent();
    }

    showCurrent() {
        const message =
            this.manager.getCurrentMessage();
    
        if (!message) {
            return;
        }
    
        this.overlay.showMessage(
            message,
            {
                isLast:
                    this.manager.isLastMessage()
            }
        );
    }

    update() {

        if (!this.manager.active) {
            return;
        }

        const message =
            this.manager.getCurrentMessage();

        if (!message) {
            return;
        }

        // We will eventually handle typing here.
    }

    shutdown() {
        this.overlay?.destroy();
        this.overlay = null;
        this.manager = null;
    }
}