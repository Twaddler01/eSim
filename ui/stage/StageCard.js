export default class StageCard {

    constructor(scene, options = {}) {
    
        this.scene = scene;
        this.container = options.container ?? scene.add.container();
    
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
    
        this.width = options.width ?? 300;
        this.height = options.height ?? 140;
    
        this.title = options.title ?? 'Item';
        this.amount = options.amount ?? 0;
        this.max = options.max ?? 100;
    
        this.actionLabel =
            options.actionLabel ?? 'ACTION';
    
        this.create();
    }

    create() {

        // --------------------------------------------------
        // Card background
        // --------------------------------------------------

        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);


        // --------------------------------------------------
        // Title
        // --------------------------------------------------

        this.titleText =
            this.scene.add.text(
                this.x + 15,
                this.y + 12,
                this.title,
                {
                    fontSize: '22px',
                    color: '#ffffff'
                }
            );


        // --------------------------------------------------
        // Amount
        // --------------------------------------------------

        this.amountText =
            this.scene.add.text(
                this.x + 15,
                this.y + 48,
                `${this.amount} / ${this.max}`,
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            );


        // --------------------------------------------------
        // Progress background
        // --------------------------------------------------

        const barX = this.x + 15;
        const barY = this.y + 78;

        const barWidth = this.width - 30;
        const barHeight = 12;


        this.progressBackground =
            this.scene.add.rectangle(
                barX,
                barY,
                barWidth,
                barHeight,
                0x222222
            )
            .setOrigin(0);


        // --------------------------------------------------
        // Progress fill
        // --------------------------------------------------

        this.progressFill =
            this.scene.add.rectangle(
                barX,
                barY,
                0,
                barHeight,
                0x44aa44
            )
            .setOrigin(0);


        // --------------------------------------------------
        // Action button
        // --------------------------------------------------

        const buttonWidth = 120;
        const buttonHeight = 30;

        const buttonX =
            this.x +
            this.width / 2 -
            buttonWidth / 2;

        const buttonY =
            this.y +
            this.height -
            buttonHeight -
            10;


        this.actionButton =
            this.scene.add.rectangle(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                0x333333
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0xffffff)
            .setInteractive();


        this.actionText =
            this.scene.add.text(
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2,
                this.actionLabel,
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5);


        // --------------------------------------------------
        // Button event
        // --------------------------------------------------

        this.actionButton.on(
            'pointerdown',
            () => {

                console.log(
                    `Action: ${this.actionLabel}`
                );

            }
        );

        this.container.add([this.background, this.titleText, this.amountText, this.progressBackground, this.progressFill, this.actionButton, this.actionText]);
        this.updateProgress();
    }


    updateProgress() {

        const percent =
            Phaser.Math.Clamp(
                this.amount / this.max,
                0,
                1
            );

        this.progressFill.width =
            this.progressBackground.width * percent;
    }


    setAmount(amount) {

        this.amount = amount;

        this.amountText.setText(
            `${this.amount} / ${this.max}`
        );

        this.updateProgress();
    }
    
    destroy() {
        this.container.remove([
            this.background,
            this.titleText,
            this.amountText,
            this.progressBackground,
            this.progressFill,
            this.actionButton,
            this.actionText
        ]);
    
        this.background.destroy();
        this.titleText.destroy();
        this.amountText.destroy();
        this.progressBackground.destroy();
        this.progressFill.destroy();
        this.actionButton.destroy();
        this.actionText.destroy();
    }
}