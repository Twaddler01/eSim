import CreateUpgradesCard from './cards/CreateUpgradesCard.js';
import GatherCard from './cards/GatherCard.js';
import CreateItemsCard from './cards/CreateItemsCard.js';
import DiscoverCard from './cards/DiscoverCard.js';

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
        // For lock overlay (discover tab)  or filter in other tabs
        this.getLockState = options.getLockState ?? (() => 'locked');

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

        // Set interactive areas to be limited within scrolling area
        this.viewport = options.viewport ?? null;

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

        // Button state and card updates
        this.getCardState = options.getCardState ?? (() => 'locked');
        this.getCardUpdates = options.getCardUpdates ?? (() => null);

        // Callbacks
        this.canAction = options.canAction ?? (() => true);
        this.onAction = options.onAction ?? null;

        // HELPERS
        this.helpers = options.helpers ?? {};
        // actionButtonState

        // Pass all data for class cards
        this.options = options;
        
        // Button event handler
        this._actionHandler = () => {
            const canAction = this.canAction();
            if (!canAction) {
                return;
            }
            this.onAction?.();
        };
        
        // ALL elements (tab container)
        this.elements = [];
        
        // Source for ALL cards
        this.ui = {};
        // Specialized UI cards by type

        this.create();
        this.update(options);
    }

    isPointerVisible(pointer) {
        return this.viewport?.scrollBox
            ?.isPointerInside(pointer) ?? true;
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
                //this.createGather();
                this.gatherCard =
                    new GatherCard(this.scene, {
                        ...this.options,
                        container: this.container,
                        x: 10,
                        y: 10,
                        width: this.width,
                        height: this.height,
                        titleY: this.ui.title.y + 70,
                        // Functions needed
                        isPointerVisible: pointer => this.isPointerVisible(pointer),
                        updateLockUI: locked => this.updateLockUI(locked)
                    }
                );
                break;
            case 'create':
                if (this.subTab === 'items') {
                    this.createItemsCard =
                        new CreateItemsCard(this.scene, {
                            ...this.options,
                            container: this.container,
                            x: 10,
                            y: 10,
                            width: this.width - 20,
                            height: this.height - 20,
                            // Functions needed
                            isPointerVisible: pointer => this.isPointerVisible(pointer),
                            updateLockUI: locked => this.updateLockUI(locked),
                        }
                    );
                }
                if (this.subTab === 'upgrades') {
                    this.createUpgradesCard =
                        new CreateUpgradesCard(this.scene, {
                            ...this.options,
                            container: this.container,
                            x: 10,
                            y: 10,
                            width: this.width - 20,
                            height: this.height - 20,
                            // Functions needed
                            isPointerVisible: pointer => this.isPointerVisible(pointer),
                            updateLockUI: locked => this.updateLockUI(locked),
                        }
                    );
                }
                break;
            case 'discover':
                this.discoverCard =
                    new DiscoverCard(this.scene, {
                        ...this.options,
                        container: this.container,
                        x: 10,
                        y: 10,
                        width: this.width - 20,
                        height: this.height - 20,
                        // Functions needed
                        refreshHeight: newHeight => this.refreshHeight(newHeight),
                        isPointerVisible: pointer => this.isPointerVisible(pointer),
                        updateLockUI: locked => this.updateLockUI(locked),
                        updateDiscoverOverlay: state => this.updateDiscoverOverlay(state)
                    }
                );
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
        const lockedState = this.getLockState();

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
            .setVisible(lockedState === 'locked')
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
            .setVisible(lockedState === 'locked')
        );
        
        // DISCOVER ONLY
        if (this.tab === 'discover') {
            this.ui.availabilityTitle =
                this.addElement(
                    addText(this.scene,
                        this.width / 2,
                        this.height / 2 - this.ui.availabilityText.height - 5,
                        'STATUS',
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

//--------------------------------
// PROCESS UI UPDATES [ StageViewport ]
//--------------------------------

    update() {
        this.updateUI();
    }

    updateUI(data) {
        switch (this.tab) {
            case 'gather':
                this.gatherCard?.update();
                break;
            case 'create':
                // Default
                if (this.subTab === 'items') {
                    this.createItemsCard?.update();
                }
                // Update for subTab class
                if (this.subTab === 'upgrades') {
                    this.createUpgradesCard?.update();
                }
                break;
            case 'discover':
                this.discoverCard?.update();;
                break;
        }
    }

    // LOCKED OVERLAY AND OTHER UI
    updateLockUI(locked) {
        this.ui.lockOverlay?.setVisible(locked);
        this.ui.availabilityText?.setVisible(locked);
    }
    
    updateDiscoverOverlay(data) {
        // tracked
        if (data.tracked !== undefined) {
            const strokeStyleW = data.tracked ? 5: 1;
            const strokeStyleC = data.tracked ? 0x44aa44: 0xffffff;
    
            this.ui.background?.setStrokeStyle(strokeStyleW, strokeStyleC);
        }
        
        // unlockText
        if (data.unlockText !== undefined) {
            this.ui.unlockTitle?.setText(data.unlockText);
        }
        
        // RESET
        this.ui.availabilityTitle?.setVisible(false);

        // availabilityText
        if (data.availabilityText?.state === 'active') {
            this.ui.availabilityTitle?.setVisible(true);
            this.ui.availabilityText?.setVisible(true).setText('[ IN PROGRESS ]');
        }
        if (data.availabilityText?.state === 'completed') {
            this.ui.availabilityTitle?.setVisible(true);
            this.ui.availabilityText?.setVisible(true).setText('COMPLETED');
            this.ui.background?.setFillStyle(0x112a12);
        }
    }

//--------------------------------
// POSITION ADJUSTMENTS
//--------------------------------

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