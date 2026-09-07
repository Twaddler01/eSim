import { listenToEvent } from '../../../utils/stageHelpers.js';

// CreateItemsCard.js
export default class DiscoverCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        this.isPointerVisible = options.isPointerVisible ?? (() => true);
        
        // Use this.x, this.y (inherited)
        this.container = options.container ?? null;

        // For tracking objectives in DISCOVER tab
        this.objectivesManager = options.objectivesManager ?? null;

        // From StageCard
        this.updateLockUI = options.updateLockUI ?? (() => {});
        this.updateDiscoverOverlay = options.updateDiscoverOverlay ?? (() => 'locked');
        // For lock overlay (discover tab)  or filter in other tabs
        this.getLockState = options.getLockState ?? (() => 'locked');
        
        // ???
        this.canAction = options.canAction ?? (() => false);
        this.onAction = options.onAction ?? null;

        // HELPERS
        this.helpers = options.helpers ?? {};
        // actionButtonState

        // Data
        this.getCardUpdates = options.getCardUpdates ?? (() => null);
        
        // For create button (stageProgress.getCreateUpgradesStatus)
        // enabled, active, locked
        this.getCardState = options.getCardState ?? (() => 'locked');

        this.id = options.id ?? null;
        this.startsUnlocked = options.startsUnlocked ?? null;
        this.required = options.required ?? null;
        this.unlocked = options.unlocked ?? null;
        this.refreshHeight = options.refreshHeight;

        this._actionHandler = () => {
            const canAction = this.canAction();
            if (!canAction) {
                return;
            }
            this.onAction?.();
        };

        this.elements = [];
        this.discoverUI = {};

        this.create();
    }

    create() {
        // (Title already setup) (15, 12)
        let startY = 12;
        const titleHeight = 24.27;

        const x = 30;
        
        // WIP  Active only top center
        this.discoverUI.descriptionText =
            this.addElement(
                addText(this.scene,
                    x,
                    startY + titleHeight + 5,
                    this.description,
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        // LEFT SIDE
        const availability = this.getCardState();
        const requireText = availability === 'completed' ? 'Required:' : 'Requires:';

        this.discoverUI.requireLabel =
            this.addElement(
                addText(this.scene,
                    x,
                    30,
                    requireText,
                    {
                        fontSize: '30px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );

        let currentY = 30 + this.discoverUI.requireLabel.height + 15;
        
        if (this.required.items.length) {
            this.discoverUI.requireItemsTitleText =
                this.addElement(
                    addText(this.scene,
                        x + 10,
                        currentY,
                        'ITEMS',
                        {
                            fontSize: '16px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0)
            );
            if (this.startsUnlocked) this.discoverUI.requireItemsTitleText.setVisible(false);
            
            currentY += this.discoverUI.requireItemsTitleText.height + 5;
            
            this.required.items.forEach(item => {
                const count = item.amt > 0 ? item.amt : '';
                this.discoverUI.requireList =
                    this.addElement(
                        addText(this.scene,
                            x + 20,
                            currentY,
                            '- ' + item.title + ' ' + count,
                            {
                                fontSize: '16px',
                                color: '#fff200'
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
                        x + 10,
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
                            x + 20,
                            currentY,
                            '- ' + item.title,
                            {
                                fontSize: '16px',
                                color: '#fff200'
                            }
                        )
                    .setOrigin(0)
                );
                currentY += this.discoverUI.requireChildrenList.height + 5;
            });
        }
        
        const requirementsBottomY = currentY;
        
        // RIGHT SIDE
        let unlocksItemsTitleTextHeight = 0;
        let currentX = this.width / 3 * 2 + 30;
        
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
                                color: '#fff200'
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
                                color: '#fff200'
                            }
                        )
                    .setOrigin(0)
                );
                
                currentY += this.discoverUI.unlocksObjText.height + 5;
                
            });
        }

        const unlocksBottomY = currentY;
        
        // Use whichever column is taller
        const contentBottomY =
            Math.max(
                requirementsBottomY,
                unlocksBottomY
            );
        
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
            this.height = requiredHeight;
            this.refreshHeight(requiredHeight);
        }
        
        this.createTrackingUI();
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

        this.updateDiscoverOverlay({
            tracked
        });
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
                        // initializeObjectiveTracking(), setObjectiveTracked()
                        event.type === 'objective-track'
                    ) {
                        this.updateTracking();
                    }
                }
            );

        // INITIAL TRACKING STATE
        this.updateTracking();
    
        this.discoverUI.trackButton.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
        
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

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

//--------------------------------
// UPDATES ... WIP
//--------------------------------

    update() {
        const data = {
            cardUpdates: this.getCardUpdates(),
            state: this.getCardState(),
            lockState: this.getLockState()
            
        };

        this.updateTracking();

        this.updateUI(data.state);
    }

    // AVAILABILITY
    updateUI(state) {
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
        this.updateLockUI(false);
        this.discoverUI.availabilityTitle?.setVisible(false);

        // Discover updates
        const requireText = state === 'completed' ? 'Required:' : 'Requires:';
        this.discoverUI.requireLabel?.setText(requireText);
        
        const unlockText = state === 'completed' ? 'Unlocked:' : 'Unlocks:';
        this.updateDiscoverOverlay({
            unlockText
        });

        // ACTIVE
        if (state === 'active') {
            this.updateDiscoverOverlay({
                availabilityText: {
                    state: 'active'
                }
            });
            
            return;
        }

        // COMPLETED
        if (state === 'completed') {
            this.updateDiscoverOverlay({
            availabilityText: {
                    state: 'completed'
                }
            });

            return;
        }

        // LOCKED
        this.updateLockUI(true);
    }

    // DESTROY
    destroy() {
        this.removeObjectiveListener?.();
        
        this.elements.forEach(
            element => element.destroy()
        );
        this.elements = [];
        this.container?.destroy();
        this.discoverUI = {};
    }
}