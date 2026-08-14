import { stageItems } from '../../data/stageData.js';

export default class StageCard {

    constructor(scene, options = {}) {
        this.scene = scene;
    
        this.container = options.container ?? scene.add.container();
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.objective = options.objective ?? false;

        this.upgradeDisplayHeight = 60; // 0

        this.depth = this.scene.depths?.cards ?? 0;

        // Item data
        this.id = options.id ?? null;
        this.title = options.title ?? 'Item';
        this.amount = options.amount ?? 0;
        this.description = options.description ?? '';
        this.objectiveText = options.objectiveText ?? null;

        // null = no maximum
        this.max = options.max ?? null;
// WIP
this.nextMax = options.nextMax ?? null;
        this.upgradeStats = options.upgradeStats ?? null;
        this.availability = options.availability ?? 'locked';
        this.requirements = options.requirements ?? {};
        this.produces = options.produces ?? {};
        this.actionLabel = options.actionLabel ?? 'ACTION';
        this.upgradable = options.gather?.upgrade?.enabled === true;
        this.tab = options.tab ?? 'gather';

        this.children = options.children ?? [];
        this.getChildComplete = options.getChildComplete ?? (() => false);
    
        // Callbacks
        this.onAction = options.onAction ?? null;
        this.canAction = options.canAction ?? (() => true);
        this.getAmount = options.getAmount ?? (() => 0);

        this.upgradeGatherRow = [];
        this.upgradeMaxRow = [];
        
        this.childObjectiveTexts = [];
        this.requirementTexts = [];
        this.upgradeTexts = [];
        this.reqLabel = null;

        this.height = options.height ?? this.getCardHeight(options);

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
            addText(this.scene,
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
            addText(this.scene,
                this.x + 15,
                this.y + 12,
                this.title,
                {
                    fontSize: '22px',
                    color: '#ffffff'
                }
            );

        this.descriptionText =
            addText(this.scene,
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
            addText(this.scene,
                this.x + 15,
                this.y + 48,
                '',
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            );
        this.amountText.setVisible(!this.description);

        this.reqLabel =
            addText(this.scene,
                this.x + 15,
                this.y + 73, // +25
                (this.objective && this.children.length) || this.objectiveText ? 'Complete Objectives:' : 'Requirements:',
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);

        let contentBottom = this.y + 73;
        
        contentBottom = this.createObjectiveRequirements(this.y + 73);
        
        // Optional special objective text
        if (this.objectiveText) {
            this.objectiveTextDisplay =
                addText(
                    this.scene,
                    this.x + 15,
                    contentBottom,
                    this.objectiveText,
                    {
                        fontSize: '16px',
                        color: '#66ff66'
                    }
                );
                contentBottom += this.objectiveTextDisplay.height + 5;
        }

        if (this.objective && this.children.length) {
            contentBottom =
                this.createChildObjectiveLayout(
                    contentBottom
                );
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

        if (this.upgradable) {
            // Upgrade display
            this.createUpgradeLayout(
                barX,
                barY + 20
            );
        }

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
            addText(this.scene,
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
            ...this.childObjectiveTexts.map(
                requirement =>
                    requirement.text
            ),
            ...this.requirementTexts.map(
                requirement =>
                    requirement.text
            ),
            ...this.upgradeTexts,
            ...(this.objectiveTextDisplay
                ? [this.objectiveTextDisplay]
                : []),
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
        switch (options.tab) {
            case 'create': {
                const requirementCount =
                    Object.keys(
                        options.requirements ?? {}
                    ).length;
                return 190 + requirementCount * 22;
            }

case 'discover': {

    const childCount =
        options.children?.length ?? 0;

    const itemRequirementCount =
        (options.requirements?.items ?? [])
            .reduce(
                (total, requirement) =>
                    total +
                    Object.keys(requirement).length,
                0
            );

    if (options.children?.length > 0 || itemRequirementCount > 0) {
        // Starting point for the requirements section.
        let contentHeight = 73;
    
        // "Complete Objectives:" / "Requirements:" label
        contentHeight += 25;
    
        // Child objectives
        if (childCount > 0) {
            contentHeight += childCount * 22;
        }
    
        // Item requirements
        if (itemRequirementCount > 0) {
            contentHeight += itemRequirementCount * 22;
        }
    
        // Space below requirements + progress bar
        contentHeight += 17;
    
        // Bottom padding / button area
        contentHeight += 50;
    
        return contentHeight;
    }
}
            case 'gather':
                return 180 + this.upgradeDisplayHeight;
            default:
                return 180;
        }
    }

    // CURRENT UPGRADES -- For createUpgradeLayout()
    updateUpgrades() {
        if (!this.upgradeStats) {
            return;
        }
    
        const gatherActive =
            this.upgradeStats.rateIncrease > 0;
    
        const maxActive =
            this.upgradeStats.maxIncrease > 0;
    
        // Title
        this.upgradeLabelTitle.setVisible(
            gatherActive || maxActive
        );
    
        // Individual rows
        this.upgradeGatherRow.forEach(
            text => text.setVisible(gatherActive)
        );
    
        this.upgradeMaxRow.forEach(
            text => text.setVisible(maxActive)
        );
    
        // Values
        this.upgradeGatherText.setText(
            `${Math.round(
                this.upgradeStats.rateIncrease * 10
            ) / 10}`
        );
    
        this.upgradeMaxText.setText(
            `${this.upgradeStats.maxIncrease}`
        );
    
        // Reposition active rows
        let currentY =
            this.upgradeLabelTitle.y + 30;
    
        if (gatherActive) {
            this.upgradeGatherRow.forEach(
                text => text.y = currentY
            );
    
            currentY += 22;
        }
    
        if (maxActive) {
            this.upgradeMaxRow.forEach(
                text => text.y = currentY
            );
        }
    }

    // PARENT LAYOUT
    createChildObjectiveLayout(startY) {
    
        let y = startY;
    
        if (!this.children.length) {
            return y;
        }
    
        this.children.forEach(child => {
    
            const text =
                addText(
                    this.scene,
                    this.x + 15,
                    y,
                    '',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                );
    
            this.childObjectiveTexts.push({
                id: child.id ?? child,
                title: child.title ?? child.id,
                text
            });
    
            y += 22;
        });
    
        return y;
    }
    
    updateChildObjectives() {
        if (!this.childObjectiveTexts) {
            return;
        }
    
        this.childObjectiveTexts.forEach(child => {
    
            const complete =
                this.getChildComplete?.(child.id) ?? false;
    
            child.text
                .setText(
                    `${child.title}: ${complete ? '✓' : '✕'}`
                )
                .setColor(
                    complete
                        ? '#66ff66'
                        : '#ff6666'
                );
        });
    }

    // UPGRADE LAYOUT
    createUpgradeLayout(startX, startY) {
        let currentY = startY;
        this.upgradeLabelTitle =
            addText(this.scene,
                startX,
                currentY,
                'ACTIVE UPGRADES',
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);

        currentY += 30;
        this.upgradeAmountLabel =
            addText(this.scene,
                startX + 5,
                currentY,
                'GATHER increase: +',
                {
                    fontSize: '16px',
                    color: '#66ff66'
                }
            )
            .setOrigin(0);
        
        this.upgradeGatherText =
            addText(this.scene,
                startX + 5 + 145,
                currentY,
                '0',
                {
                    fontSize: '16px',
                    color: '#66ff66'
                }
            )
            .setOrigin(0);
        
        currentY += 22;
        this.upgradeMaxLabel =
            addText(this.scene,
                startX + 5,
                currentY,
                'MAX increase: +',
                {
                    fontSize: '16px',
                    color: '#66ff66'
                }
            )
            .setOrigin(0);
        
        this.upgradeMaxText =
            addText(this.scene,
                startX + 5 + 120,
                currentY,
                '0',
                {
                    fontSize: '16px',
                    color: '#66ff66'
                }
            )
            .setOrigin(0);

        this.upgradeGatherRow = [
            this.upgradeAmountLabel,
            this.upgradeGatherText
        ];
        
        this.upgradeMaxRow = [
            this.upgradeMaxLabel,
            this.upgradeMaxText
        ];

        this.upgradeTexts = [
            this.upgradeLabelTitle,
            ...this.upgradeGatherRow,
            ...this.upgradeMaxRow
        ];
    }

    // CREATE REQUIREMENTS FOR OBJECTIVES
    createObjectiveRequirements(startY) {
        let y = startY + 25;

        // Normal objective requirements
        const itemRequirements =
            this.requirements?.items ?? [];
            
        if (itemRequirements.length) {
            itemRequirements.forEach(requirement => {
    
                Object.entries(requirement)
                    .forEach(([id, required]) => {
    
                        const text =
                            addText(
                                this.scene,
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
            });
        }
        return y;
    }

    // UPDATE EVERYTHING
    update(data = {}) {
        if (data.amount !== undefined) {
            this.setAmount(
                data.amount
            );
        }

        if (data.upgradeStats !== undefined) {
            this.upgradeStats = data.upgradeStats;
        }

        if (data.availability !== undefined) {
            this.availability =
                data.availability;
        }
        
        // Update child objectives
        this.updateChildObjectives();;

        // Update requirement display
        this.updateRequirements(this.getAmount);

        // Refresh upgrade display
        this.updateUpgrades();

        // Update button / overlay
        this.updateAvailability();
    }

    // REQUIREMENTS
    updateRequirements(getAmount) {
        this.requirementTexts.forEach(
            requirement => {
    
                const amount =
                    getAmount(requirement.id);
    
                const ready =
                    amount >= requirement.required;
    
                const reqItem =
                    stageItems.find(
                        item => item.id === requirement.id
                    );
    
                const title =
                    reqItem?.title ?? requirement.id;
    
                requirement.text.setText(
                    `${title}: ${Math.floor(amount)} / ${requirement.required} ${ready ? '✓' : '✕'}`
                );
    
                requirement.text.setColor(
                    ready
                        ? '#66ff66'
                        : '#ff6666'
                );
            }
        );
    }

    // AVAILABILITY
    updateAvailability() {
    
        const state = this.availability;
    
        // Reset
        this.lockOverlay.setVisible(false);
        this.availabilityText.setVisible(false);
    
        // ACTIVE
        if (state === 'active') {
    
            this.actionButton
                .setFillStyle(0x333333)
                .setStrokeStyle(1, 0xffffff);
    
            this.actionText
                .setText(this.actionLabel)
                .setColor('#ffffff');
    
            return;
        }
    
        // UNLOCKED
        if (state === 'unlocked') {
    
            this.availabilityText
                .setText('REQUIREMENTS NOT MET')
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
    
        // COMPLETED
        if (state === 'completed') {
    
            this.actionButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
    
            this.actionText
                .setText('COMPLETED')
                .setColor('#66ff66');
    
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

        this.childObjectiveTexts
            .forEach(
                requirement =>
                    requirement.text.destroy()
            );

        // Requirements
        this.requirementTexts
            .forEach(
                requirement =>
                    requirement.text.destroy()
            );

        this.requirementTexts = [];

        // Upgrades
        this.upgradeTexts
            .forEach(
                upgrade =>
                    upgrade.destroy()
            );

        this.upgradeTexts = [];
        this.upgradeGatherRow = [];
        this.upgradeMaxRow = [];
        
        // Optional requirements label
        this.reqLabel?.destroy();
        this.reqLabel = null;

        // Main elements
        this.background?.destroy();
        this.descriptionText?.destroy();
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