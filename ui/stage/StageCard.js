import { listenToEvent } from '../../utils/stageHelpers.js';
import CreateUpgradesCard from './cards/CreateUpgradesCard.js';

// FOR GATHER, CREATE, DISCOVER TABS
export default class StageCard {

    constructor(scene, options = {}) {
        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 930;

        // Tab references
        this.tab = options.tab ?? 'gather';
        this.subTab = options.subTab ?? null;

        const CARD_HEIGHTS = {
            tab: {
                gather: 200,
                create: 200,
                discover: 200
            },
            sub: {
                updates: 300
            }
        };
        this.height = CARD_HEIGHTS.tab[this.tab] ?? 200;
        if (this.subTab) {
            this.height = CARD_HEIGHTS.sub[this.subTab] ?? this.height;
        }
        
        // Use 0, 0
        this.container = this.scene.add.container(this.x, this.y);
        options.parentContainer.add(this.container);

        // Gather | Upgrade areas if upgradeStats.enabled
        this.upgradeBoxWidth = 200;
        this.gatherLeftPanelWidth = this.width - this.upgradeBoxWidth;
        
        this.depth = this.scene.depths?.cards ?? 0;

        // Data
        this.id = options.id ?? null;
        this.title = options.title ?? options.id ?? 'ItemTitle';
        this.description = options.description ?? '';
        this.actionLabel = options.actionLabel ?? 'ACTION';
        this.tab = options.tab ?? 'gather';
        this.required = options.required ?? null;
        this.unlocked = options.unlocked ?? null;
        this.objectiveText = options.objectiveText ?? null;

        // LIVE DATA GETTERS
        this.getAmount = options.getAmount ?? (() => 0);
        this.getMax = options.getMax ?? (() => null);
        this.getNextMax = options.getNextMax ?? (() => null);
        this.getUpgradeStats = options.getUpgradeStats ?? (() => null);
        this.getAvailability = options.getAvailability ?? (() => 'locked');

        this.getLevel = options.getLevel ?? (() => null);

        // Callbacks
        this.getCreateData = options.getCreateData ?? (() => null);
        this.canUpgrade = options.canUpgrade ?? (() => false);
        this.onUpgrade = options.onUpgrade ?? null;
        this.canAction = options.canAction ?? (() => true);
        this.onAction = options.onAction ?? null;

        // For tracking objectives in DISCOVER tab
        this.objectivesManager = options.objectivesManager ?? null;

        // Pass data for CreateUpgradesCard
        this.options = this.subTab === 'upgrades' ? options : null;

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
    create(options = {}) {
        // ui
        this.createBackground();
        this.createTitle();

        switch (this.tab) {
            case 'gather':
                this.createGather();
                break;
            case 'create':
                // Move into new class
                if (this.subTab === 'upgrades') {
                    this.createUpgradesCard =
                        new CreateUpgradesCard(this.scene, {
                            ...this.options,
                            container: this.container,
                            x: 10,
                            y: 10,
                            width: this.width - 20,
                            height: this.height - 20,
                            // GETTERS
                            getAvailability: this.getAvailability,
                            getLevel: this.getLevel,
                            // To grab new state for overlay
                            onAvailabilityChange: state =>
                                this.updateAvailability(state)
                        }
                    );
                } else {
                    this.createCreate();
                }
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

        // SKIP Create: Upgrades / Discover
        if (this.subTab === 'items' || this.tab === 'discover') return;
        const titleHeght = 24.265625;
        this.ui.titleBar =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    0,
                    this.width,
                    titleHeght + 25,
                    0x000077,
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
                    0.75
                )
            .setOrigin(0)
            .setStrokeStyle(1, 0xffffff)
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
        if (this.tab === 'discover') {
            const availability = this.getAvailability();

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
        let titleX = this.width / 2;
        let titleOriginX = 0.5;
        if (this.tab === 'gather') {
            titleX = this.gatherLeftPanelWidth / 2;
        }
        if (this.tab === 'create') {
            titleOriginX = 0;
            titleX = 10;
        }
        
        this.ui.title =
            this.addElement(
                addText(
                    this.scene,
                    titleX,
                    12,
                    this.title,
                    {
                        fontSize: '22px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(titleOriginX, 0)
        );
    }

    updateTracking() {
        const tracked =
            this.objectivesManager
                .isObjectiveTracked(this.id);

        this.discoverUI.trackIcon
                ?.setFillStyle(
                    tracked
                        ? 0xcc4444
                        : 0x44aa44
                );
        
            this.discoverUI.trackIconText
                ?.setText(
                    tracked
                        ? '−'
                        : '+'
                );

        this.discoverUI.trackButtonText?.setText(
            tracked
                ? 'UNTRACK'
                : 'TRACK'
        );
        
        const strokeStyleW = tracked ? 5: 1;
        const strokeStyleC = tracked ? 0x44aa44: 0xffffff;
        this.ui.background?.setStrokeStyle(strokeStyleW, strokeStyleC);
    }

//--------------------------------
// GATHER TAB
//--------------------------------

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
                    this.updateGatherUpgrades?.(upgradeData);
                }
            );
        }
    }

    // PRIMARY GATHER UPDATE CALLS
    updateGather(data) {
        this.updateGatherProgress(
            data.amount, data.max
        );
        this.updateGatherUpgrades(data.upgradeStats);
        this.updateAvailability(data.availability); // multi
        this.updateGatherUpgradeAvailability();
    }

    // CURRENT UPGRADE updates
    updateGatherUpgrades(upgradeStats) {
        if (!upgradeStats.hasUpgrade) {
            return;
        }
    
        // Max updates
        if (this.gatherUI.maxLabel) this.gatherUI.maxLabel.setText(`Max: ${upgradeStats.current_max}`);
                
        // Level update
        this.gatherUI.upgradeText.setText(`Upgrade Level: ${upgradeStats.level}`);
        
        // Gather rate update
        if (upgradeStats.hasRateUpgrade) this.gatherUI.gainLabel.setText(`Gather Rate: +${upgradeStats.currentGatherRate}`);
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
        this.updateCreateRequirements(data.createData);
        this.updateAvailability(data.availability);
    }

    // Create live updates
    updateCreateRequirements(data) {
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
        
        const availability = this.getAvailability();
        const requireText = availability === 'completed' ? 'Required:' : 'Requires:';
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
        
        const unlockText = availability === 'completed' ? 'Unlocked:' : 'Unlocks:';
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

        const contentBottomY = currentY;
        
        // Give the card room for the button
        const buttonHeight = 30;
        const buttonGap = 10;
        const bottomPadding = 10;
        
        const requiredHeight =
            contentBottomY +
            buttonGap +
            buttonHeight +
            bottomPadding;
        
        if (requiredHeight > this.height) {
            this.refreshHeight(requiredHeight);
        }

        this.createTrackingUI();
    }

    createTrackingUI() {

        this.discoverUI.trackButton =
            this.addElement(
                this.scene.add.rectangle(
                    this.width / 2,
                    this.height - 40,
                    140,
                    32,
                    0x000055
                )
                .setOrigin(0.5)
                .setInteractive({
                    useHandCursor: true
                })
                .setStrokeStyle(1, 0xffffff)
            );
        
        this.discoverUI.trackIcon =
            this.addElement(
                this.scene.add.circle(
                    this.width / 2 - 45,
                    this.height - 40,
                    10,
                    0x44aa44
                )
            );
        
        this.discoverUI.trackIconText =
            this.addElement(
                addText(
                    this.scene,
                    this.width / 2 - 45,
                    this.height - 40,
                    '+',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
                .setOrigin(0.5)
            );
        
        this.discoverUI.trackButtonText =
            this.addElement(
                addText(
                    this.scene,
                    this.width / 2 - 20,
                    this.height - 40,
                    'TRACK',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
                .setOrigin(0, 0.5)
            );

        // LISTEN FOR OBJECTIVE CHANGES
        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                event => {
        
                    if (event.id !== this.id) {
                        return;
                    }
        
                    if (
                        event.type === 'objective-track' //||
                        //event.type === 'objective-unlock'
                    ) {
                        this.updateTracking();
                    }
                }
            );

        // INITIAL TRACKING STATE
        this.updateTracking();
    
        this.discoverUI.trackButton.on(
            'pointerdown',
            () => {
        
                const tracked =
                    this.objectivesManager
                        .isObjectiveTracked(
                            this.id
                        );
        
                this.objectivesManager
                    .setObjectiveTracked(
                        this.id,
                        !tracked
                    );
            }
        );
    }

    updateDiscover(data) {
        this.updateTracking();
        this.updateAvailability(data.availability);
    }

//--------------------------------
// UI UPDATES FOR ALL CARDS [ StageViewport ]
//--------------------------------

    update() {
        const data = {
            amount: this.getAmount(),
            max: this.getMax(),
            nextMax: this.getNextMax(),
            upgradeStats: this.getUpgradeStats(),
            availability: this.getAvailability(),
            createData: this.getCreateData()
        };
        
        this.updateUI(data);
    }

    updateUI(data) {
        switch (this.tab) {
            case 'gather':
                this.updateGather(data);
                break;
            case 'create':
                // Default
                if (this.subTab === 'items') {
                    this.updateCreate(data);
                }
                // Update for subTab class
                if (this.subTab === 'upgrades') {
                    this.createUpgradesCard?.update();
                }
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
    updateAvailability(state) {

        // Track UI for only active objectives
        const canTrack =
            state !== 'completed' &&
            state !== 'locked';
        this.discoverUI.trackButton?.setVisible(canTrack);
        this.discoverUI.trackButtonText?.setVisible(canTrack);
        this.discoverUI.trackIcon?.setVisible(canTrack);
        this.discoverUI.trackIconText?.setVisible(canTrack);

        if (canTrack) {
            this.updateTracking();
        }
    
        // Reset
        this.ui.lockOverlay?.setVisible(false);
        this.ui.availabilityText?.setVisible(false);
        this.discoverUI.availabilityTitle?.setVisible(false);

        // Skip if 'enabled' from this.createUpgradesCard
        if (state === 'enabled') {
            return;
        }

        // Discover updates
        const requireText = state === 'completed' ? 'Required:' : 'Requires:';
        this.discoverUI.requireLabel?.setText(requireText);
        
        const unlockText = state === 'completed' ? 'Unlocked:' : 'Unlocks:';
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
                this.discoverUI.availabilityTitle?.setVisible(true);
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
                this.discoverUI.availabilityTitle?.setVisible(true);
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
        this.ui.lockOverlay?.setVisible(true);
        this.ui.availabilityText?.setVisible(true);
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
        this.removeObjectiveListener?.();
  
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