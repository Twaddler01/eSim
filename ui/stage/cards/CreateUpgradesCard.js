// CreateUpgradesCard.js
// data source: stageCardData.js -> getCreateUpgradesCardData()
export default class CreateUpgradesCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        this.isPointerVisible = options.isPointerVisible ?? (() => true);
        
        // Use this.x, this.y (inherited)
        this.container = options.container ?? null;

        // stageItems item id upgrade is for
        this.item = options.item ?? null;
        this.getLevel = options.getLevel ?? (() => null);

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
            this.onAction?.(this.item);
        };

        this.elements = [];
        this.ui = {};

        this.create();
    }

    create() {
        // Title and overlay integrated already
        const titleX = this.x + 5;
        let upgradeY = this.y + 24.265625 + 30;
        // Area below title box
        const bottomArea = 24.265625 + 25;
    
        this.ui.upgradeAutoLabel =
            this.addElement(
                addText(this.scene,
                    titleX,
                    upgradeY,
                    'Auto Gather',
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
            this.ui.upgradeAutoStatusLabel =
            this.addElement(
                addText(this.scene,
                    titleX + 150 + 150 + 120 / 2,
                    upgradeY,
                    'Status: ',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
    
        this.ui.upgradeAutoStatus =
            this.addElement(
                addText(this.scene,
                    titleX + 150 + 150 + this.ui.upgradeAutoStatusLabel.width + 120 / 2,
                    upgradeY,
                    'Inactuve',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );

        this.ui.upgradeAutoLevel =
            this.addElement(
                addText(this.scene,
                    titleX + 150 + 150 + 150 + this.ui.upgradeAutoStatusLabel.width + 120 / 2,
                    upgradeY,
                    'Level: ' + this.level,
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
            .setVisible(false)
        );
        
        const cardUpdates = this.getCardUpdates();

        // Upgrade auto button
        const upgradeButtonStroke = 1;
        const upgradeButtonHeght = 30;
        const upgradeButtonWidth = 120;
        this.ui.upgradeAutoButton =
            this.addElement(
                this.scene.add.rectangle(
                    this.width - 120 - 50,
                    this.height / 2 + 25 + 15/2,
                    upgradeButtonWidth,
                    upgradeButtonHeght,
                    cardUpdates?.buttonFill
                )
                .setOrigin(0, 0.5)
                .setStrokeStyle(
                    upgradeButtonStroke,
                    cardUpdates?.buttonStroke
                )
                .setInteractive()
            );

        // Click action
        this.ui.upgradeAutoButton.on(
            'pointerdown', pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
                this._actionHandler();
            }
        );

        this.ui.upgradeAutoButtonText =
            this.addElement(
                addText(this.scene,
                    this.width - 120 - 50 + 60,
                    this.height / 2 + 25,
                    'UPGRADE',
                    {
                        fontSize: '16px',
                        color: cardUpdates?.buttonTextColor
                    }
                )
            .setOrigin(0.5, 0)
        );

        if (!cardUpdates.requirements) return;
        
        upgradeY += this.ui.upgradeAutoLabel.height + 10;
        this.ui.upgradeRequiresTitle =
            this.addElement(
                addText(this.scene,
                    titleX + 5,
                    upgradeY,
                    'REQUIRES: ',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0)
        );
        
        let requiresY = upgradeY + this.ui.upgradeRequiresTitle.height + 5;

        this.ui.upgradeRequirements = [];

        cardUpdates.requirements.forEach(item => {
            const text = this.addElement(
                addText(this.scene, titleX + 5, requiresY,
                    `${item.title} ${item.cnt} / ${item.amt}`,
                    {
                        fontSize: '16px',
                        color: item.color
                    }
                )
            ).setOrigin(0);
        
            this.ui.upgradeRequirements.push({
                text
            });
        
            requiresY += 22;
        });
        
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

//--------------------------------
// UPDATES
//--------------------------------

    // Started from StageCard
    update() {
        const data = {
            level: this.getLevel(),
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
        if (!cardUpdates || !this.ui.upgradeRequirements) {
            return;
        }
    
        cardUpdates.requirements.forEach((item, index) => {
            const requirement =
                this.ui.upgradeRequirements[index];
    
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

        this.ui.upgradeAutoLevel.setText('Level: ' + data.level);
        
        const enabled = data.level > 0;
        const upgradeStatus = {
            text: enabled ? 'Active' : 'Inactive',
            color: enabled ? '#66ff66' : '#ff6666',
            visible: enabled ? true : false
        };

        this.ui.upgradeAutoStatus.setText(upgradeStatus.text);
        this.ui.upgradeAutoStatus.setColor(upgradeStatus.color);
        this.ui.upgradeAutoLevel.setVisible(upgradeStatus.visible);

        this.helpers.actionButtonState(data.state, {
            rectangle: this.ui.upgradeAutoButton,
            text: this.ui.upgradeAutoButtonText
        }, 'UPGRADE');
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