export default class DialogueScene extends Phaser.Scene {

    constructor() {
        super('DialogueScene');

        this.depths = {
            overlay: 1000,
            window: 1010,
            text: 1020,
            button: 1030
        };
    }

    init(data) {
        this.message =
            data.message ??
            'This is a test conversation.';

        this.returnScene =
            data.returnScene ??
            'CreationScene';
    }

    create() {

        const width = this.scale.width;
        const height = this.scale.height;

        // ==========================================
        // DARK OVERLAY
        // ==========================================

        this.overlay =
            this.add.rectangle(
                0,
                0,
                width,
                height,
                0x000000,
                0.70
            )
            .setOrigin(0)
            .setDepth(this.depths.overlay)
            .setInteractive();

        // ==========================================
        // DIALOG WINDOW
        // ==========================================

        const windowWidth = width * 0.85;
        const windowHeight = 300;

        const windowX =
            (width - windowWidth) / 2;

        const windowY =
            (height - windowHeight) / 2;

        this.dialogWindow =
            this.add.rectangle(
                windowX,
                windowY,
                windowWidth,
                windowHeight,
                0x111133
            )
            .setOrigin(0)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(this.depths.window);

        // ==========================================
        // TEXT
        // ==========================================

        this.dialogText =
            addText(
                this,
                windowX + 25,
                windowY + 30,
                this.message,
                {
                    fontSize: '22px',
                    color: '#ffffff',
                    wordWrap: {
                        width: windowWidth - 50
                    }
                }
            )
            .setOrigin(0)
            .setDepth(this.depths.text);

        // ==========================================
        // NEXT BUTTON
        // ==========================================

        const buttonWidth = 140;
        const buttonHeight = 40;

        const buttonX =
            windowX +
            windowWidth -
            buttonWidth -
            20;

        const buttonY =
            windowY +
            windowHeight -
            buttonHeight -
            20;

        this.nextButton =
            this.add.rectangle(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                0x335533
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x66aa66)
            .setInteractive()
            .setDepth(this.depths.button);

        this.nextButtonText =
            addText(
                this,
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2,
                'NEXT',
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5)
            .setDepth(this.depths.button);

        this.nextButton.on(
            'pointerdown',
            () => this.close()
        );
    }

    close() {

        // Resume the scene underneath us
        this.scene.resume(this.returnScene);

        // Remove this scene
        this.scene.stop();
    }
}