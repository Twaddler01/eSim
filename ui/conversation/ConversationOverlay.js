export default class ConversationOverlay {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.onNext =
            options.onNext ?? null;

        this.onCancel =
            options.onCancel ?? null;

        // Dialog dimensions
        this.width =
            options.width ??
            scene.scale.width - 100;

        this.height =
            options.height ??
            280;

        // Dialog position
        this.x =
            options.x ??
            50;

        this.y =
            options.y ??
            scene.scale.height / 4;

        this.elements = [];
        this.dialogElements = [];

        this.create();
    }

    addElement(element) {
        this.elements.push(element);
        return element;
    }

    addDialogElement(element) {
        this.dialogElements.push(element);
        this.dialogContainer.add(element);
        return element;
    }

    create() {

        const scene = this.scene;

        const screenWidth =
            scene.scale.width;

        const screenHeight =
            scene.scale.height;

        // ==========================================
        // FULL SCREEN OVERLAY
        // ==========================================

        this.overlay =
            this.addElement(
                scene.add.rectangle(
                    0,
                    0,
                    screenWidth,
                    screenHeight,
                    0x000000,
                    0.75
                )
                .setOrigin(0)
                .setInteractive()
            );


        // ==========================================
        // DIALOG CONTAINER
        // ==========================================

        this.dialogContainer =
            scene.add.container(
                this.x,
                this.y
            );

        this.elements.push(
            this.dialogContainer
        );


        // ==========================================
        // DIALOG WINDOW
        // ==========================================

        this.window =
            this.addDialogElement(
                scene.add.rectangle(
                    0,
                    0,
                    this.width,
                    this.height,
                    0x111133,
                    1
                )
                .setOrigin(0)
                .setStrokeStyle(
                    2,
                    0xffffff
                )
            );


        // ==========================================
        // CONTENT
        // ==========================================

        const padding = 25;

        // Speaker
        this.speakerText =
            this.addDialogElement(
                addText(
                    scene,
                    padding,
                    20,
                    '',
                    {
                        fontSize: '24px',
                        color: '#ffff66'
                    }
                )
            );


        // Message
        this.messageText =
            this.addDialogElement(
                addText(
                    scene,
                    padding,
                    70,
                    '',
                    {
                        fontSize: '20px',
                        color: '#ffffff',
                        wordWrap: {
                            width:
                                this.width -
                                padding * 2
                        }
                    }
                )
            );


        // ==========================================
        // NEXT BUTTON
        // ==========================================

        const buttonWidth = 120;
        const buttonHeight = 40;

        this.nextButton =
            this.addDialogElement(
                scene.add.rectangle(
                    this.width - buttonWidth - padding,
                    this.height - buttonHeight - padding,
                    buttonWidth,
                    buttonHeight,
                    0x335533
                )
                .setOrigin(0)
                .setStrokeStyle(
                    1,
                    0x66aa66
                )
                .setInteractive()
            );

        this.nextButtonText =
            this.addDialogElement(
                addText(
                    scene,
                    this.nextButton.x +
                        buttonWidth / 2,
                    this.nextButton.y +
                        buttonHeight / 2,
                    'NEXT',
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            )
            .setOrigin(0.5);

        this.nextButton.on(
            'pointerdown',
            () => this.onNext?.()
        );


        // ==========================================
        // CANCEL BUTTON
        // ==========================================

        this.cancelButton =
            this.addDialogElement(
                scene.add.rectangle(
                    padding,
                    this.height - buttonHeight - padding,
                    buttonWidth,
                    buttonHeight,
                    0x333333
                )
                .setOrigin(0)
                .setStrokeStyle(
                    1,
                    0x666666
                )
                .setInteractive()
            );

        this.cancelButtonText =
            this.addDialogElement(
                addText(
                    scene,
                    this.cancelButton.x +
                        buttonWidth / 2,
                    this.cancelButton.y +
                        buttonHeight / 2,
                    'CLOSE',
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            )
            .setOrigin(0.5);

        this.cancelButton.on(
            'pointerdown',
            () => this.onCancel?.()
        );
    }


    showMessage(message) {

        this.speakerText
            .setText(message.speaker);

        this.messageText
            .setText(message.text);
    }


    setPosition(x, y) {

        this.x = x;
        this.y = y;

        this.dialogContainer
            .setPosition(x, y);
    }


    destroy() {

        this.dialogElements = [];

        this.elements.forEach(
            element => element.destroy()
        );

        this.elements = [];

        this.overlay = null;
        this.dialogContainer = null;
    }
}