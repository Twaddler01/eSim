export default class StageCard {

    constructor(scene, options = {}) {
    
        this.scene = scene;
        this.container = options.container ?? scene.add.container();
    
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.type = options.type ?? 'gather';
        this.height = options.height ?? this.getCardHeight(options);
        this.width = options.width ?? 300;
        this.depth = this.scene.depths.cards;
        
        this.title = options.title ?? 'Item';
        this.amount = options.amount ?? 0;
        this.max = options.max ?? 100;

        this.requirements =
            options.requirements ?? {};

        this.produces =
            options.produces ?? {};

        this.actionLabel =
            options.actionLabel ?? 'ACTION';
        this.onAction = options.onAction ?? null;

        // Function supplied by StageUI
        this.canAction =
            options.canAction ?? (() => true);

        this.getAmount =
            options.getAmount ??
            (() => 0);

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

        if (this.type === 'gather') {
            this.createGatherLayout();
        }
        
        if (this.type === 'craft') {
            this.createCraftLayout();
        }

        // --------------------------------------------------
        // Requirements
        // --------------------------------------------------

        this.requirementTexts = [];
        this.createRequirements();

        // --------------------------------------------------
        // Progress background
        // --------------------------------------------------

        const barX = this.x + 15;
        const barY = this.y + 105;

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
        this.actionButton.setDepth(this.depth);

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

        this._actionHandler = () => {
            if (!this.canAction()) {
                return;
            }
            if (this.onAction) {
                this.onAction();
            }
        };
        this.actionButton.on(
            'pointerdown',
            this._actionHandler
        );

        this.container.add([
            this.background,
            this.titleText,
            this.amountText,
        
            ...this.requirementTexts.map(
                requirement => requirement.text
            ),
        
            this.progressBackground,
            this.progressFill,
        
            this.actionButton,
            this.actionText
        ]);
        this.container.setDepth(this.depth);

        this.updateProgress();
        
        this.updateRequirements(this.getAmount);
        this.updateAvailability();
    }
// WIP
    createGatherLayout() {
        // progress bar
        // GATHER button
    }
    
    createCraftLayout() {
        // requirements
        // CRAFT button
    }

    getCardHeight(options) {
    
        switch (this.type) {
    
            case 'craft': {
    
                const requirementCount =
                    Object.keys(
                        options.requirements ?? {}
                    ).length;
    
                // Base card + one row per requirement
                return 180 + requirementCount * 30;
            }
    
            case 'discover':
                return 200;
    
            case 'research':
                return 200;
    
            case 'gather':
            default:
                return 180;
        }
    }  

    // --------------------------------------------------
    // Requirements
    // --------------------------------------------------

    createRequirements() {

        let y = this.y + 75;

        Object.entries(this.requirements)
            .forEach(([id, required]) => {

                const text =
                    this.scene.add.text(
                        this.x + 15,
                        y,
                        '',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    );

                this.requirementTexts.push({
                    id,
                    required,
                    text
                });

                y += 22;
        });
    }


    // --------------------------------------------------
    // Update requirements
    // --------------------------------------------------

    updateRequirements(getAmount) {

        this.requirementTexts.forEach(requirement => {

            const amount =
                getAmount(requirement.id);

            const ready =
                amount >= requirement.required;

            requirement.text.setText(
                `${requirement.id}: ${amount} / ${requirement.required} ${ready ? '✓' : '✕'}`
            );

            requirement.text.setColor(
                ready
                    ? '#66ff66'
                    : '#ff6666'
            );

        });
    }

    // --------------------------------------------------
    // Update button availability
    // --------------------------------------------------

    updateAvailability() {

        const available =
            this.canAction();


        if (available) {

            this.actionButton
                .setFillStyle(0x333333)
                .setStrokeStyle(1, 0xffffff);

            this.actionText
                .setText(this.actionLabel)
                .setColor('#ffffff');

        } else {

            this.actionButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);

            this.actionText
                .setText('LOCKED')
                .setColor('#777777');
        }
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
    
    // --------------------------------------------------
    // Destroy
    // --------------------------------------------------

    destroy() {

        this.container.remove([
            this.background,
            this.titleText,
            this.amountText,
            ...this.requirementTexts.map(r => r.text),
            this.progressBackground,
            this.progressFill,
            this.actionButton,
            this.actionText
        ]);

        this.background.destroy();
        this.titleText.destroy();
        this.amountText.destroy();

        this.requirementTexts.forEach(
            requirement => {
                requirement.text.destroy();
            }
        );

        this.progressBackground.destroy();
        this.progressFill.destroy();
        this.actionButton.destroy();
        this.actionText.destroy();
    }
}