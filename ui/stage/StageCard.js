// FOR GATHER, CREATE, DISCOVER TABS
export default class StageCard {

    constructor(scene, options = {}) {
        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 930;
        this.tab = options.tab ?? 'gather';
        const CARD_HEIGHTS = {
            gather: 150,
            create: 200,
            discover: 200
        };
        this.height = CARD_HEIGHTS[this.tab] ?? 200;
        this.container = this.scene.add.container(this.x, this.y);
        options.parentContainer.add(this.container);

        // Gather | Upgrade areas if this.upgradeStats.enabled
        this.upgradeBoxWidth = 200;
        this.gatherLeftPanelWidth = this.width - this.upgradeBoxWidth;
        
        this.depth = this.scene.depths?.cards ?? 0;

        // Data
        this.id = options.id ?? null;
        this.title = options.title ?? 'Item';
        this.description = options.description ?? '';
        this.actionLabel = options.actionLabel ?? 'ACTION';
        this.tab = options.tab ?? 'gather';
        this.required = options.required ?? null;
        this.unlocked = options.unlocked ?? null;
        this.objectiveText = options.objectiveText ?? null;

        // Function values
        this.upgradeStats = options.upgradeStats ?? null;
        this.amount = options.amount ?? 0;
        this.max = options.max ?? null;
        this.availability = options.availability ?? 'locked';
        // WIP this.percent = options.percent ?? null;

        // Callbacks
        this.getCreateData = options.getCreateData ?? (() => null);
        this.canUpgrade = options.canUpgrade ?? (() => false);
        this.onUpgrade = options.onUpgrade ?? null;
        this.canAction = options.canAction ?? (() => true);
        this.onAction = options.onAction ?? null;

        // Button event handler
        this._actionHandler = () => {
            if (!this.canAction()) {
                return;
            }
            this.onAction?.();
        };
        
        // ALL elements (tab container)
        this.elements = [];
        
        // Source for ALL cards
        this.ui = {};
        // Specialized UI cards by type
        this.gatherUI = {};
        this.createUI = {};
        this.discoverUI = {};

        this.create();
        this.update(options);
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // CREATE
    create() {
        // ui
        this.createBackground();
        this.createTitle();

        switch (this.tab) {
            case 'gather':
                this.createGather();
                break;
            case 'create':
                this.createCreate();
                break;
            case 'discover':
                this.createDiscover();
                break;
        }
        
        this.createStatusOverlay();
    }

    createBackground() {
        this.ui.background =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    0,
                    this.width,
                    this.height,
                    0x000055
                )
                .setOrigin(0)
                .setStrokeStyle(1, 0xffffff)
            );
    }

    createStatusOverlay() {
        // Locked overlay
        this.ui.lockOverlay =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    0,
                    this.width,
                    this.height,
                    0x000000,
                    0.55
                )
            .setOrigin(0)
        );
                
        // Availability message
        this.ui.availabilityText =
            this.addElement(
                addText(this.scene,
                    this.width / 2,
                    this.height / 2,
                    'LOCKED',
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5)
        );
        
        // DISCOVER ONLY
        if (this.tab === 'discover' && this.availability !== 'locked') {
            this.discoverUI.availabilityTitle =
                this.addElement(
                    addText(this.scene,
                        this.width / 2,
                        this.height / 2 - this.ui.availabilityText.height - 5,
                        'STATUS:',
                        {
                            fontSize: '22px',
                            color: '#ffff00'
                        }
                    )
                .setOrigin(0.5)
            );
        }
    }

    createTitle() {
        this.ui.title =
            this.addElement(
                addText(
                    this.scene,
                    15,
                    12,
                    this.title,
                    {
                        fontSize: '22px',
                        color: '#ffffff'
                    }
                )
            );
    }

//--------------------------------
// GATHER TAB
//--------------------------------

    createGather() {
        // Gain label -- uses this.upgradeStats
        let currentGatherRate = 1;
        if (this.upgradeStats.hasRateUpgrade) currentGatherRate = this.upgradeStats.currentGatherRate;
        this.gatherUI.gainLabel =
            this.addElement(
                addText(this.scene,
                    15,
                    37, // +25
                    'Gather Rate: +' + currentGatherRate,
                    {
                        fontSize: '12px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        // Progress (based on max)
        const padding = 15;
        let barWidth = this.width - this.upgradeBoxWidth - padding * 2;
        const barHeight = 10;
        this.gatherUI.progressBackground =
            this.addElement(
                this.scene.add.rectangle(
                    padding,
                    67, // +30
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
                    15,
                    67, // +30
                    0,
                    barHeight,
                    0x44aa44
                )
                .setOrigin(0)
            );
            
        // Current max display
        this.gatherUI.maxLabel =
            this.addElement(
                addText(this.scene,
                    15 + barWidth - 80,
                    82, // +10 bar +5 padding
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
            this._actionHandler
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
        const upgradeData = this.upgradeStats;
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
                () => {
            
                    if (!this.canUpgrade()) {
                        return;
                    }
            
                    this.onUpgrade?.();
                    this.updateGatherUpgrades?.();
                }
            );
        }
    }

    // PRIMARY GATHER UPDATE CALLS
    updateGather(data) {
        this.updateGatherProgress();
        this.updateAvailability(); // multi
        this.updateGatherUpgradeAvailability();
    }

    // CURRENT UPGRADE updates
    updateGatherUpgrades() {
        if (!this.upgradeStats.hasUpgrade) {
            return;
        }
    
        // Max updates
        if (this.max !== null) this.gatherUI.maxLabel.setText(`Max: ${this.upgradeStats.current_max}`);
                
        // Level update
        this.gatherUI.upgradeText.setText(`Upgrade Level: ${this.upgradeStats.level}`);
        
        // Gather rate update
        if (this.upgradeStats.hasRateUpgrade) this.gatherUI.gainLabel.setText(`Gather Rate: +${this.upgradeStats.currentGatherRate}`);
    }

    // GATHER PROGRESS updates
    updateGatherProgress() {
        if (
            this.max == null ||
            this.max <= 0
        ) {
            this.gatherUI.progressBackground
                .setVisible(false);
    
            this.gatherUI.progressFill
                .setVisible(false);
    
            return;
        }
    
        this.gatherUI.progressBackground
            .setVisible(true);
    
        this.gatherUI.progressFill
            .setVisible(true);
    
        const percent =
            Phaser.Math.Clamp(
                this.amount / this.max,
                0,
                1
            );
    
        this.gatherUI.progressFill.width  =
            this.gatherBarWidth * percent;
    }

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

//--------------------------------
// CREATE TAB
//--------------------------------

    createCreate() {
        //console.log('Creating create card');
        const yOffset = this.height / 2 - 50;
        this.ui.title.y = yOffset;
        
        const requirements = this.getCreateData();
        const allReqMetButtonColor_stro = requirements.allReqMet ? 0x66aa66 : 0x555555;
        const allReqMetButtonColor_fill = requirements.allReqMet ? 0x335533 : 0x222222;
        const allReqMetTextColor = requirements.allReqMet ? '#ffffff' : '#555555';

        let currentY = yOffset + 35;
        
        this.createUI.descriptionText =
            this.addElement(
                addText(this.scene,
                    15,
                    currentY,
                    this.description,
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        currentY += this.createUI.descriptionText.height + 5;


        this.createUI.producesLabels = [];
        requirements.produces.forEach(pro => {
            const text =
                this.addElement(
                    addText(this.scene,
                        15,
                        currentY,
                        '- Create: +' + pro.producesCnt + ' ' + pro.title,
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            
            this.createUI.producesLabels.push(text);
            
            currentY += text.height + 5;
            
        });

        this.offsetY = yOffset; // WIP If requirements list gets too long
        this.createUI.requiresTitle =
            this.addElement(
                addText(this.scene,
                    this.width / 3 + 15,
                    yOffset, // Same y as title
                    'REQUIRES:',
                    {
                        fontSize: '24px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        //let currentY = yOffset + 35;
        // Store text for updates
        this.createUI.requiresLabels = [];
 
        currentY = yOffset + 35;
        requirements.req.forEach(require => {
            const reqMetColor = require.reqMet ? '#66ff66' : '#ff6666';
            const text =
                this.addElement(
                    addText(this.scene,
                        this.width / 3 + 25,
                        currentY,
                        require.title + ': ' + require.cnt + ' / ' + require.req,
                        {
                            fontSize: '18px',
                            color: reqMetColor
                        }
                    )
                .setOrigin(0)
            );
            
            this.createUI.requiresLabels.push(text);
            currentY += 24;
        });
        
        // Create button
        this.createUI.createButton =
            this.addElement(
                this.scene.add.rectangle(
                    this.width - 200,
                    this.height / 2 - 15,
                    120,
                    30,
                    allReqMetButtonColor_fill
                )
                .setOrigin(0)
                .setStrokeStyle(1, allReqMetButtonColor_stro)
                .setInteractive()
            );
        
        this.createUI.createButtonText =
            this.addElement(
                addText(this.scene,
                    (this.width - 200) + 22,
                    this.height / 2 - 11,
                    this.actionLabel,
                    {
                        fontSize: '20px',
                        color: allReqMetTextColor
                    }
                )
            .setOrigin(0)
        );
        
        // Click action
        this.createUI.createButton.on(
            'pointerdown',
            this._actionHandler
        );
    }

    // PRIMARY CREATE UPDATE CALLS
    updateCreate(data) {
        this.updateCreateRequirements();
        this.updateAvailability();
    }

    // Create live updates
    updateCreateRequirements() {
        const data =
            this.getCreateData();
    
        if (!data) {
            return;
        }
    
        data.req.forEach(
            (require, index) => {
                const text =
                    this.createUI.requiresLabels[index];
                if (!text) {
                    return;
                }
    
                text.setText(
                    `${require.title}: ${require.cnt} / ${require.req}`
                );
    
                text.setColor(
                    require.reqMet
                        ? '#66ff66'
                        : '#ff6666'
                );
            }
        );
        
        // Update rates WIP -- dynsmic in the future?
        /*data.produces.forEach(
            (prod, index) => {
                const text =
                    this.createUI.producesLabels[index];
                if (!text) {
                    return;
                }
    
                text.setText('- Create: +' + prod.producesCnt + ' ' + prod.title);
            }
        );*/

        // Update CREATE button
        const ready =
            data.allReqMet;
    
        this.createUI.createButton
            ?.setFillStyle(
                ready
                    ? 0x335533
                    : 0x222222
            )
            .setStrokeStyle(
                1,
                ready
                    ? 0x66aa66
                    : 0x555555
            );
    
        this.createUI.createButtonText
            ?.setColor(
                ready
                    ? '#ffffff'
                    : '#555555'
            );
    }

//--------------------------------
//ddd DISCOVER TAB
//--------------------------------
/*
tab: 'discover',
id: obj.id,
title: obj.title,
objectiveText: obj.objectiveText,
description: obj.description,

availability: this.getAvailability(obj, 'discover'),

required: {
    items: [],
    objectives: [],
    children: []
},

unlocked: {
    items: [],
    objectives: [],
    children: []
}*/

    createDiscover() {
        // (Title already setup) (15, 12)
        let startY = 12;
        
        // Active only
        this.discoverUI.descriptionText =
            this.addElement(
                addText(this.scene,
                    15,
                    startY + this.ui.title.height + 5,
                    this.description,
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        const requireText = this.availability === 'completed' ? 'Required:' : 'Requires:';
        this.discoverUI.requireLabel =
            this.addElement(
                addText(this.scene,
                    15,
                    this.discoverUI.descriptionText.y + this.discoverUI.descriptionText.height + 10,
                    requireText,
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        let currentY = this.discoverUI.requireLabel.y + this.discoverUI.requireLabel.height + 5;
        
        if (this.required.items.length) {
            this.discoverUI.requireItemsTitleText =
                this.addElement(
                    addText(this.scene,
                        25, // +10
                        currentY,
                        'ITEMS',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            currentY += this.discoverUI.requireItemsTitleText.height + 5;
            
            this.required.items.forEach(item => {
                const count = item.amt > 0 ? item.amt : '';
                this.discoverUI.requireList =
                    this.addElement(
                        addText(this.scene,
                            35, // +10
                            currentY,
                            '- ' + item.title + ' ' + count,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
                currentY += this.discoverUI.requireList.height + 5;
            });
        }

        if (this.required.children.length) {
            this.discoverUI.requireObjTitleText =
                this.addElement(
                    addText(this.scene,
                        25, // +10
                        currentY,
                        'OBJECTIVES',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            currentY += this.discoverUI.requireObjTitleText.height + 5;
            
            this.required.children.forEach(item => {
                this.discoverUI.requireChildrenList =
                    this.addElement(
                        addText(this.scene,
                            35, // +10
                            currentY,
                            '- ' + item.title,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
                currentY += this.discoverUI.requireChildrenList.height + 5;
            });
        }
        
        if (currentY > this.height) {
            this.refreshHeight(currentY + 10);
        }
        
        // For unlocks display
        const currentX = this.width - 250;
        currentY = 30;
        
        const unlockText = this.availability === 'completed' ? 'Unlocked:' : 'Unlocks:';
        if (this.unlocked.items.length || this.unlocked.objectives.length) {
            this.discoverUI.unlockTitle =
                this.addElement(
                    addText(
                        this.scene,
                        currentX,
                        currentY,
                        unlockText,
                        {
                            fontSize: '30px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
        
            currentY += this.discoverUI.unlockTitle.height + 15;
        }
        
        let unlocksItemsTitleTextHeight = 0;
        if (this.unlocked.items.length) {
            this.discoverUI.unlocksItemsTitleText =
                this.addElement(
                    addText(this.scene,
                        currentX,
                        currentY,
                        'ITEMS',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            unlocksItemsTitleTextHeight = this.discoverUI.unlocksItemsTitleText.height;
            
            currentY += this.discoverUI.unlocksItemsTitleText.height + 5;

            this.unlocked.items.forEach(item => {
                this.discoverUI.unlocksItemsText =
                    this.addElement(
                        addText(this.scene,
                            currentX,
                            currentY,
                            '- ' + item.title,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
                
                currentY += this.discoverUI.unlocksItemsText.height + 5;
            });
        }
        
        currentY += unlocksItemsTitleTextHeight;

        if (this.unlocked.objectives.length) {
            this.discoverUI.unlocksObjTitleText =
                this.addElement(
                    addText(this.scene,
                        currentX,
                        currentY,
                        'OBJECTIVES',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            
            currentY += this.discoverUI.unlocksObjTitleText.height + 5;

            this.unlocked.objectives.forEach(item => {
                this.discoverUI.unlocksObjText =
                    this.addElement(
                        addText(this.scene,
                            currentX,
                            currentY,
                            '- ' + item.title,
                            {
                                fontSize: '16px',
                                color: '#ffffff'
                            }
                        )
                    .setOrigin(0)
                );
                
                currentY += this.discoverUI.unlocksObjText.height + 5;
                
            });
        }

        if (currentY > this.height) {
            this.refreshHeight(currentY + 10);
        }


    }

    updateDiscover(data) {
        this.updateAvailability();
    }

//--------------------------------
// UPDATES FOR ALL CARDS [ StageViewport ]
//--------------------------------

    update(data = {}) {
        if ('amount' in data) {
            this.amount = data.amount;
        }
    
        if ('max' in data) {
            this.max = data.max;
        }

        if ('percent' in data) {
            this.percent = data.percent;
        }

        if ('availability' in data) {
            this.availability = data.availability;
        }
    
        if ('canUpgrade' in data) {
            this.canUpgrade = data.canUpgrade;
        }
    
        if ('upgradeStats' in data) {
            this.upgradeStats = data.upgradeStats;
        }
    
        switch (this.tab) {
    
            case 'gather':
                this.updateGather(data);
                break;
    
            case 'create':
                this.updateCreate(data);
                break;
    
            case 'discover':
                this.updateDiscover(data);
                break;
        }
    }

    setY(y) {
        this.y = y;
        this.container.y = y;
    }

    // Dynamic height WIP (OLD?)
    refreshHeight(newHeight) {
        if (this.height === newHeight) {
            return false;
        }
    
        this.height = newHeight;
    
        this.ui.background?.setSize(
            this.width,
            this.height
        );
    
        this.ui.lockOverlay?.setSize(
            this.width,
            this.height
        );
    
        this.ui.availabilityText?.setY(
            this.height / 2
        );
    
        return true;
    }

//--------------------------------
// AVAILABILITY FUNCTIONS (MULTI)
//--------------------------------

    // AVAILABILITY
    updateAvailability() {
        let state = this.availability;

        // Reset
        this.ui.lockOverlay?.setVisible(false);
        this.ui.availabilityText?.setVisible(false);

        // Discover updates
        const requireText = this.availability === 'completed' ? 'Required:' : 'Requires:';
        this.discoverUI.requireLabel?.setText(requireText);
        
        const unlockText = this.availability === 'completed' ? 'Unlocked:' : 'Unlocks:';
        this.ui.unlockTitle?.setText(unlockText);

        // ACTIVE
        if (state === 'active') {
            // Gather
            this.gatherUI.gatherButton
                ?.setFillStyle(0x333333)
                .setStrokeStyle(1, 0xffffff);
            this.gatherUI.gatherButtonText
                ?.setText(this.actionLabel)
                .setColor('#ffffff');
            // Create
            this.createUI.createButton
                ?.setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66);
            this.createUI.createButtonText
                ?.setColor('#ffffff');
            // Discover
            if (this.tab === 'discover') {
                this.ui.availabilityText?.setVisible(true)
                    .setText('[ IN PROGRESS ]');
            }
            
            return;
        }
    
        // UNLOCKED
        if (state === 'unlocked') {
            // Gather
            this.gatherUI.gatherButton?.setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
            this.gatherUI.gatherButtonText?.setText('LOCKED')
                .setColor('#777777');
            // Create
            this.createUI.createButton
                ?.setFillStyle(0x222222)
                .setStrokeStyle(1, 0x555555);
            this.createUI.createButtonText
                ?.setColor('#777777');

            return;
        }
    
        // COMPLETED
        if (state === 'completed') {
            // Discover
            if (this.tab === 'discover') {
                this.ui.availabilityText?.setVisible(true)
                    .setText('COMPLETED');
                this.ui.background?.setFillStyle(0x112a12);
            }
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
    
        // LOCKED
        this.ui.lockOverlay?.setVisible(true)
            .setAlpha(0.55);
        this.ui.availabilityText?.setText('LOCKED')
            .setVisible(true);
        // Gather
        this.gatherUI.gatherButton?.setFillStyle(0x222222)
            .setStrokeStyle(1, 0x555555);
        this.gatherUI.gatherButtonText?.setText('LOCKED')
            .setColor('#777777');
        // Create
        this.createUI.createButton
            ?.setFillStyle(0x222222)
            .setStrokeStyle(1, 0x555555);
        this.createUI.createButtonText
            ?.setColor('#777777');
    }

    // DESTROY
    destroy() {
        this.elements.forEach(
            element => element.destroy()
        );
        this.elements = [];
        this.container?.destroy();
        this.ui = {};
        this.gatherUI = {};
        this.createUI = {};
        this.discoverUI = {};
    }
}