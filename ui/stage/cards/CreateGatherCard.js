// CreateGatherCard.js
// data source: stageCardData.js -> getCurrentTabCardData()
export default class CreateGatherCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        this.titleY = options.titleY ?? 82;
        this.isPointerVisible = options.isPointerVisible ?? (() => true);
        
        // Use this.x, this.y (inherited)
        this.container = options.container ?? null;

        // Layout
        this.upgradeBoxWidth = 200;
        this.gatherLeftPanelWidth =
            this.width - this.upgradeBoxWidth;
        this.title = options.title ?? '';

        // From StageCard
        this.getAmount = options.getAmount ?? (() => 0);
        this.canUpgrade = options.canUpgrade ?? (() => false);
        this.onUpgrade = options.onUpgrade ?? null;
        this.getMax = options.getMax ?? (() => null);
        this.getNextMax = options.getNextMax ?? (() => null);
        this.getAvailability = options.getAvailability ?? (() => 'locked');
        this.updateLockUI = options.updateLockUI ?? (() => {});
        this.canAction = options.canAction ?? (() => false);
        this.onAction = options.onAction ?? null;
        
        // Data
        this.actionLabel = options.actionLabel ?? 'GATHER';
        this.getUpgradeStats = options.getUpgradeStats ?? (() => null);
        this.unlocked = options.unlocked ?? (() => false);

        // Button event handler
        this._actionHandler = () => {
            if (!this.canAction()) {
                return;
            }
            this.onAction?.();
        };

        this.elements = [];
        this.gatherUI = {};

        this.createGather();
    }

    createGather() {
        // Gain label -- uses this.upgradeStats
        const upgradeStats = this.getUpgradeStats();
        let gatherY = 67; // +55
        let currentGatherRate = 1;
        if (upgradeStats.hasRateUpgrade) currentGatherRate = upgradeStats.currentGatherRate;
        this.gatherUI.gainLabel =
            this.addElement(
                addText(this.scene,
                    15,
                    gatherY,
                    'Gather Rate: +' + currentGatherRate,
                    {
                        fontSize: '12px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        gatherY += 50;
        
        // Progress (based on max)
        const padding = 1;
        let barWidth = this.width - this.upgradeBoxWidth - padding * 2;
        const barHeight = 10;
        this.gatherUI.progressBackground =
            this.addElement(
                this.scene.add.rectangle(
                    padding,
                    gatherY,
                    barWidth,
                    barHeight,
                    0x222222
                )
                .setOrigin(0)
            );
        
        // Stored progress value
        this.gatherBarWidth = barWidth;
        this.gatherUI.progressFill =
            this.addElement(
                this.scene.add.rectangle(
                    padding,
                    gatherY,
                    0,
                    barHeight,
                    0x44aa44
                )
                .setOrigin(0)
            );
        gatherY += 15; // +10 bar +5 padding
        
        // Current max display
        this.gatherUI.maxLabel =
            this.addElement(
                addText(this.scene,
                    15 + barWidth - 80,
                    gatherY,
                    'Max: ' + this.max,
                    {
                        fontSize: '12px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        // Gather button
        const gatherButtonStroke = 1;
        const gatherButtonHeght = 30;
        this.gatherUI.gatherButton =
            this.addElement(
                this.scene.add.rectangle(
                    this.gatherLeftPanelWidth / 2 - 60,
                    this.height - gatherButtonHeght - 10,
                    120,
                    gatherButtonHeght,
                    0x335533
                )
                .setOrigin(0)
                .setStrokeStyle(
                    gatherButtonStroke,
                    0x66aa66
                )
                .setInteractive()
            );

        // Click action
        this.gatherUI.gatherButton.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
                this._actionHandler();
            }
        );

        this.gatherUI.gatherButtonText =
            this.addElement(
                addText(this.scene,
                    this.gatherLeftPanelWidth / 2,
                    this.height - gatherButtonHeght / 2 - (gatherButtonHeght / 2 + 2 * gatherButtonStroke) / 2 - 10,
                    'GATHER',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5, 0)
        );

        // Current amount
        this.gatherUI.amount =
            this.addElement(
                addText(this.scene,
                    this.gatherLeftPanelWidth / 2,
                    this.titleY,
                    this.getAmount(),
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5, 0)
        );

        // Create gather upgrade area
        this.gatherUI.upgradeBox =
            this.addElement(
                this.scene.add.rectangle(
                    this.width - this.upgradeBoxWidth,
                    0, 
                    this.upgradeBoxWidth,
                    this.height,
                    0x000055
                )
                .setOrigin(0)
                .setStrokeStyle(1, 0xffffff)
            );
    
        this.gatherUI.upgradeText =
            this.addElement(
                addText(this.scene,
                    this.width - this.upgradeBoxWidth + 10,
                    10,
                    'No upgrades available.',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        let currentY = 10;
        const upgradeData = this.getUpgradeStats();
        if (upgradeData.hasUpgrade) {
            this.gatherUI.upgradeText.setText('Upgrade Level: ' + upgradeData.level);
            
            if (upgradeData.hasMaxUpgrade) {
                currentY += 22;
                this.gatherUI.upradeMaxIncreaseText =
                    this.addElement(
                        addText(this.scene,
                            this.width - this.upgradeBoxWidth + 10,
                            currentY,
                            'Next Max Increase: +' + upgradeData.maxIncrease,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
            }
            if (upgradeData.hasRateUpgrade) {
                currentY += 22;
                this.gatherUI.upradeRateText =
                    this.addElement(
                        addText(this.scene,
                            this.width - this.upgradeBoxWidth + 10,
                            currentY,
                            'Next Rate Increase: +' + upgradeData.rateIncrease,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
            }
            
            // Upgrade cost
            currentY += 22;
            this.gatherUI.upradeCostTitle =
                this.addElement(
                    addText(this.scene,
                        this.width - this.upgradeBoxWidth + 10,
                        currentY,
                        'Upgrade cost: ',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            
            currentY += 22;
            const amount = this.getAmount();
            this.gatherUI.upradeCost =
                this.addElement(
                    addText(this.scene,
                        this.width - this.upgradeBoxWidth + 10,
                        currentY,
                        amount + ' / ' + Math.round(upgradeData.cost) + ' ' + this.title,
                        {
                            fontSize: '16px',
                            color: amount >= upgradeStats.cost ? '#66ff66' : '#ff6666'
                        }
                    )
                .setOrigin(0)
            );    
            
            
            // Upgrade button
            this.gatherUI.upgradeButton =
                this.addElement(
                    this.scene.add.rectangle(
                        this.width - this.upgradeBoxWidth + 10,
                        this.height - 45,
                        this.upgradeBoxWidth - 20,
                        30,
                        0x333333
                    )
                    .setOrigin(0)
                    .setStrokeStyle(1, 0x666666)
                    .setInteractive()
                );

            this.gatherUI.upgradeButtonText =
                this.addElement(
                    addText(
                        this.scene,
                        this.gatherUI.upgradeButton.x + this.gatherUI.upgradeButton.width / 2,
                        this.height - 30,
                        'UPGRADE',
                        {
                            fontSize: '16px',
                            color: '#777777'
                        }
                    )
                )
                .setOrigin(0.5);
            
            this.gatherUI.upgradeButton.on(
                'pointerdown',
                pointer => {
                    if (!this.isPointerVisible(pointer)) {
                        return;
                    }
            
                    if (!this.canUpgrade()) {
                        return;
                    }
            
                    this.onUpgrade?.();
                    this.update();
                }
            );
        }
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // GATHER PROGRESS updates
    updateGatherProgress(amount, max) {
        if (
            max == null ||
            max <= 0
        ) {
            this.gatherUI.progressBackground
                .setVisible(false);
    
            this.gatherUI.progressFill
                .setVisible(false);
    
            return;
        }

        this.gatherUI.amount
            ?.setText(Math.round(amount));

        // Max updates
        this.gatherUI.maxLabel
            ?.setText(`Max: ${max}`);

        this.gatherUI.progressBackground
            .setVisible(true);
    
        this.gatherUI.progressFill
            .setVisible(true);
    
        const percent =
            Phaser.Math.Clamp(
                amount / max,
                0,
                1
            );
    
        this.gatherUI.progressFill.width  =
            this.gatherBarWidth * percent;
    }

    // CURRENT UPGRADE updates
    updateGatherUpgrades(upgradeStats, amount) {
        if (!upgradeStats.hasUpgrade) {
            return;
        }

        // Max update
        this.gatherUI.maxLabel
            ?.setText(`Max: ${upgradeStats.current_max}`);

        // Level update
        this.gatherUI.upgradeText.setText(`Upgrade Level: ${upgradeStats.level}`);

        // Gather rate update
        if (upgradeStats.hasRateUpgrade) this.gatherUI.gainLabel.setText(`Gather Rate: +${upgradeStats.currentGatherRate}`);
        
        if (this.gatherUI.upradeCost) {
            if (!amount) amount = 0;
            this.gatherUI.upradeCost.setColor(amount >= upgradeStats.cost ? '#66ff66' : '#ff6666');
            this.gatherUI.upradeCost.setText(Math.round(amount) + ' / ' + Math.round(upgradeStats.cost) + ' ' + this.title);
        }
    }

// moved
// updateGatherProgress

    updateGatherUpgradeAvailability() {
        if (!this.gatherUI.upgradeButton) {
            return;
        }
    
        const upgradeAvailable =
            this.canUpgrade();
    
        if (upgradeAvailable) {
    
            this.gatherUI.upgradeButton
                .setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66);
    
            this.gatherUI.upgradeButtonText
                ?.setColor('#ffffff');
    
        } else {
    
            this.gatherUI.upgradeButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
    
            this.gatherUI.upgradeButtonText
                ?.setColor('#777777');
        }
    }

    // PRIMARY GATHER UPDATE CALLS
    update() {
        const data = {
            amount: this.getAmount(),
            max: this.getMax(),
            nextMax: this.getNextMax(),
            upgradeStats: this.getUpgradeStats(),
            availability: this.getAvailability(),
        };
        
        this.updateUI(data);

    }

    // WIP Rework
    updateUI(data) {
        this.updateGatherProgress(data.amount, data.max);
        
        // WIP integrate within getCurrentTabCardData
        this.updateGatherUpgrades(data.upgradeStats, data.amount);
        this.updateGatherUpgradeAvailability();

        // For purchase button
        this.updateGatherButton(data.availability);
        
        const unlocked = data.availability !== 'locked';
        this.updateLockUI(unlocked);
    }

    updateGatherButton(state) {

        // ACTIVE
        if (state === 'active') {
            // Gather
            this.gatherUI.gatherButton
                ?.setFillStyle(0x333333)
                .setStrokeStyle(1, 0xffffff);
            this.gatherUI.gatherButtonText
                ?.setText(this.actionLabel)
                .setColor('#ffffff');
            return;
        }
    
        // UNLOCKED
        if (state === 'unlocked') {
            // Gather
            this.gatherUI.gatherButton?.setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
            this.gatherUI.gatherButtonText?.setText('LOCKED')
                .setColor('#777777');
            return;
        }

        // MAXED
        if (state === 'maxed') {
            // Gather only
            this.gatherUI.gatherButton?.setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
            this.gatherUI.gatherButtonText?.setText('MAXED')
                .setColor('#777777');
            return;
        }
    
        this.gatherUI.gatherButton?.setFillStyle(0x222222)
            .setStrokeStyle(1, 0x555555);
        this.gatherUI.gatherButtonText?.setText('LOCKED')
            .setColor('#777777');
    }

    // DESTROY
    destroy() {
        this.elements.forEach(
            element => element.destroy()
        );
        this.elements = [];
        this.container?.destroy();
        this.ui = {};
    }
}