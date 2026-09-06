// CreateItemsCard.js
export default class CreateItemsCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        this.isPointerVisible = options.isPointerVisible ?? (() => true);
        
        // Use this.x, this.y (inherited)
        this.container = options.container ?? null;

        // From StageCard
        this.updateLockUI = options.updateLockUI ?? (() => {});
        // For lock overlay (discover tab)  or filter in other tabs
        this.getLockState = options.getLockState ?? (() => 'locked');

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

        this._actionHandler = () => {
            const canAction = this.canAction();
            if (!canAction) {
                return;
            }
            this.onAction?.();
        };

        this.elements = [];
        this.createUI = {};

        this.create();
    }

    create() {
        // Title and overlay integrated already
        const yOffset = this.height / 2 - 50;
        
        const requirements = this.getCardUpdates();

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
        requirements.requirements.forEach(require => {
            const text =
                this.addElement(
                    addText(this.scene,
                        this.width / 3 + 25,
                        currentY,
                        require.title + ': ' + require.cnt + ' / ' + require.amt,
                        {
                            fontSize: '18px',
                            color: require.color
                        }
                    )
                .setOrigin(0)
            );
            
            this.createUI.requiresLabels.push({
                text
            });
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
                    requirements.buttonFill
                )
                .setOrigin(0)
                .setStrokeStyle(1, requirements.buttonStroke)
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
                        color: requirements.buttonTextColor
                    }
                )
            .setOrigin(0)
        );
        
        // Click action
        this.createUI.createButton.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
                this._actionHandler();
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

    // Started from StageCard
    update() {
        const data = {
            cardUpdates: this.getCardUpdates(),
            state: this.getCardState()
        };
    
        this.updateUI(data);
    }

    updateUI(data) {
        // Update requirements ui
        this.updateRequirements(data.cardUpdates);

        // For status and purchase button ui
        this.updateStatus(data);
        
        // Update lock ui
        const lockedState = this.getLockState();
        this.updateLockUI(lockedState === 'locked');
    }

    updateRequirements(cardUpdates) {
        if (!cardUpdates || !this.createUI.requiresLabels) {
            return;
        }
    
        cardUpdates.requirements.forEach((item, index) => {
            const requirement =
                this.createUI.requiresLabels[index];
    
            if (!requirement) return;
    
            requirement.text.setText(
                `${item.title} ${item.cnt} / ${item.amt}`
            );
    
            requirement.text.setColor(item.color);
        });
    }

    // Separate from StageCard
    updateStatus(data) {
        if (!data) return;

        // WIP
        this.helpers.actionButtonState(data.state, {
            rectangle: this.createUI.createButton,
            text: this.createUI.createButtonText
        }, 'CREATE');
    }

    // DESTROY
    destroy() {
        this.elements.forEach(
            element => element.destroy()
        );
        this.elements = [];
        this.container?.destroy();
        this.createUI = {};
    }
}