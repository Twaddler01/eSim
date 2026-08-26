export default class ConversationScene extends Phaser.Scene {

    constructor() {
        super('ConversationScene');
    }

    init(data) {

        this.messages =
            data.messages ?? [];

        this.pauseGame =
            data.pauseGame ?? true;

        this.returnScene =
            data.returnScene ?? null;

        this.currentIndex = 0;
    }

    create() {

        if (this.pauseGame && this.returnScene) {
            this.scene.pause(this.returnScene);
        }

        this.createOverlay();
        this.createDialog();
        this.showMessage();

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }

    createOverlay() {
        this.overlay =
            this.add.rectangle(
                0,
                0,
                this.scale.width,
                this.scale.height,
                0x000000,
                0.75
            )
            .setOrigin(0)
            .setInteractive();
    }



}