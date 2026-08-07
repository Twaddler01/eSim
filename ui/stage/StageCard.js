import { stageItems } from '../../data/stageData.js';

export default class StageCard {

    constructor(scene, options = {}) {
        this.scene = scene;
    
        this.container = options.container ?? scene.add.container();
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.type = options.type ?? 'gather';
        this.height = options.height ?? this.getCardHeight(options);
        this.depth = this.scene.depths?.cards ?? 0;

        // Item data
        this.id = options.id ?? null;
        this.title = options.title ?? 'Item';
        this.amount = options.amount ?? 0;
        this.description = options.description ?? '';
        this.startsUnlocked = options.startsUnlocked ?? false;

        // null = no maximum
        this.max = options.max ?? null;
        this.availability = options.availability ?? 'available';
        this.requirements = options.requirements ?? {};
        this.produces = options.produces ?? {};
        this.actionLabel = options.actionLabel ?? 'ACTION';

        // Callbacks
        this.onAction = options.onAction ?? null;
        this.canAction = options.canAction ?? (() => true);
        this.getAmount = options.getAmount ?? (() => 0);

        this.requirementTexts = [];
        this.reqLabel = null;

        this.create();
    }

    // CREATE
    create() {
        // Background
        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(
                1,
                0x000000
            );

        // Locked overlay
        this.lockOverlay =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000000,
                0.55
            )
            .setOrigin(0);
            
        // Availability message
        this.availabilityText =
            this.scene.add.text(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '',
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5);

        // Title
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

        this.descriptionText =
            this.scene.add.text(
                this.x + 15,
                this.y + 48,
                this.description,
                {
                    fontSize: '16px',
                    color: '#cccccc',
                    wordWrap: {
                        width: this.width - 30
                    }
                }
            );

        // Amount
        this.amountText =
            this.scene.add.text(
                this.x + 15,
                this.y + 48,
                '',
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            );
        this.amountText.setVisible(!this.description);

        // Craft requirements
        let contentBottom =
            this.y + 75;

        if (this.type === 'create' || this.type === 'discover') {
            this.createRequirementLayout(
                this.x + 15,
                this.y + 48
            );

            contentBottom =
                this.createRequirements();
        }

        // Progress bar
        const barX = this.x + 15;
        const barY = contentBottom + 5;
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

        this.progressFill =
            this.scene.add.rectangle(
                barX,
                barY,
                0,
                barHeight,
                0x44aa44
            )
            .setOrigin(0);

        // Action button
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
            .setStrokeStyle(
                1,
                0xffffff
            )
            .setInteractive();

        this.actionButton.setDepth(
            this.depth
        );

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

        // Button event
        this._actionHandler = () => {
            if (!this.canAction()) {
                return;
            }

            this.onAction?.();
        };

        this.actionButton.on(
            'pointerdown',
            this._actionHandler
        );

        // Container
        this.container.add([
            this.background,
            this.titleText,
            this.descriptionText,
            this.amountText,
            ...(this.reqLabel
                ? [this.reqLabel]
                : []),
            ...this.requirementTexts.map(
                requirement =>
                    requirement.text
            ),
            this.progressBackground,
            this.progressFill,
            this.actionButton,
            this.actionText,
            this.lockOverlay,
            this.availabilityText
        ]);

        // Initial display
        this.update({
            amount: this.amount,
            availability: this.availability
        });
    }

    // CARD HEIGHT
    getCardHeight(options) {
        switch (options.type) {
            case 'create': {
                const requirementCount =
                    Object.keys(
                        options.requirements ?? {}
                    ).length;
                return (
                    190 +
                    requirementCount * 22
                );
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

    // CRAFT LAYOUT
    createRequirementLayout(
        startX,
        startY
    ) {

        const reqLabelTitle = this.type === 'discover' ? 'Objectives:' : 'Requirements:';

        this.reqLabel =
            this.scene.add.text(
                startX,
                startY + 25,
                reqLabelTitle,
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);
    }

    // CREATE REQUIREMENTS
    createRequirements() {
        let y = this.y + 95;

        Object.entries(
            this.requirements
        )
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

        return y;
    }

    // UPDATE EVERYTHING
    update(data = {}) {
        if (data.amount !== undefined) {
            this.setAmount(
                data.amount
            );
        }

        if (data.availability !== undefined) {
            this.availability =
                data.availability;
        }

        // Update requirement display
        this.updateRequirements(this.getAmount);

        // Update button / overlay
        this.updateAvailability();
    }

    // REQUIREMENTS
    updateRequirements(getAmount) {
        this.requirementTexts
            .forEach(requirement => {
                const amount =
                    getAmount(
                        requirement.id
                    );

                const ready =
                    amount >=
                    requirement.required;
                
                const reqItem = stageItems.find(i => i.id === requirement.id);
                const reqItemTitle = reqItem ? reqItem.title : requirement.id;
                const reqDisplay = this.startsUnlocked ? 'Initial Discovery ✓' :
                    `${reqItemTitle}: ` +
                    `${Math.floor(amount)} / ` +
                    `${requirement.required} ` +
                    `${ready ? '✓' : '✕'}`;
                requirement.text.setText(reqDisplay);

                requirement.text.setColor(
                    ready
                        ? '#66ff66'
                        : '#ff6666'
                );
            });
    }

    // AVAILABILITY
    updateAvailability() {
        const state =
            this.availability ??
            (
                this.canAction()
                    ? 'available'
                    : 'locked'
            );

        // Reset
        this.lockOverlay.setVisible(false);
        this.availabilityText.setVisible(false);

        // AVAILABLE
        if (state === 'available') {
            this.actionButton
                .setFillStyle(0x333333)
                .setStrokeStyle(1, 0xffffff);

            this.actionText
                .setText(this.actionLabel)
                .setColor('#ffffff');

            return;
        }

        // MAXED
        if (state === 'maxed') {
            this.actionButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);

            this.actionText
                .setText('MAXED')
                .setColor('#777777');

            return;
        }

        // INSUFFICIENT
        if (state === 'insufficient') {
            this.availabilityText
                .setText('NEED MATERIALS')
                .setVisible(true)
                .setColor('#ff6666');

            this.actionButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);

            this.actionText
                .setText('LOCKED')
                .setColor('#777777');

            return;
        }
        
        // COMPLETED (Discoveries)
        if (state === 'completed') {
            this.actionButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
        
            this.actionText
                .setText('COMPLETED')
                .setColor('#66ff66');
        
            return;
        }

        // LOCKED
        this.lockOverlay
            .setVisible(true)
            .setAlpha(0.55);

        this.availabilityText
            .setText('LOCKED')
            .setVisible(true);

        this.actionButton
            .setFillStyle(0x222222)
            .setStrokeStyle(1, 0x555555);

        this.actionText
            .setText('LOCKED')
            .setColor('#777777');
    }

    // PROGRESS
    updateProgress() {

        // No maximum = no progress bar
        if (this.max == null || this.max <= 0) {
            this.progressBackground.setVisible(false);
            this.progressFill.setVisible(false);
            return;
        }

        this.progressBackground.setVisible(true);
        this.progressFill.setVisible(true);

        const percent =
            Phaser.Math.Clamp(this.amount / this.max, 0, 1);

        this.progressFill.width =
            this.progressBackground.width *
            percent;
    }

    // SET AMOUNT
    setAmount(amount) {
        this.amount =
            Math.max(0, amount ?? 0);

        if (this.max != null) {
            this.amountText.setText(`${Math.floor(this.amount)} / ${this.max}`);

        } else {
            this.amountText.setText(`${Math.floor(this.amount)}`);
        }

        this.updateProgress();
    }

    // SET MAX
    setMax(max) {
        this.max = max;
        
        const maxText = this.max !== null ? ` / ${this.max}` : '';
    
        this.amountText.setText(
            `${Math.floor(this.amount)}${maxText}`
        );
    
        this.updateProgress();
    }

    // DESTROY
    destroy() {
        // Button listener
        if (this.actionButton && this._actionHandler) {

            this.actionButton.off(
                'pointerdown',
                this._actionHandler
            );
        }

        // Requirements
        this.requirementTexts
            .forEach(
                requirement =>
                    requirement.text.destroy()
            );

        this.requirementTexts = [];

        // Optional requirements label
        this.reqLabel?.destroy();
        this.reqLabel = null;

        // Main elements
        this.background?.destroy();
        this.titleText?.destroy();
        this.amountText?.destroy();

        // Progress
        this.progressBackground?.destroy();
        this.progressFill?.destroy();

        // Availability
        this.lockOverlay?.destroy();
        this.availabilityText?.destroy();

        // Action
        this.actionButton?.destroy();
        this.actionText?.destroy();

        // Clear references
        this.background = null;
        this.titleText = null;
        this.amountText = null;

        this.progressBackground = null;
        this.progressFill = null;

        this.lockOverlay = null;
        this.availabilityText = null;

        this.actionButton = null;
        this.actionText = null;

        this.container = null;
    }
}