// CreateUpgradesCard.js
// data source: stageCardData.js -> getCreateUpgradesCardData()
export default class CreateUpgradesCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        
        // Use this.x, this.y (inherited)
        this.container = options.container ?? null;

        this.item = options.item ?? null;
        this.amount = options.amount ?? 0;
        this.availability = options.availability ?? 'locked';
        this.level = options.level ?? 0;

        this.canAction = options.canAction ?? (() => false);
        this.onAction = options.onAction ?? null;

        this._actionHandler = () => {
            if (!this.canAction()) {
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
        
        // Upgrade auto button
        const upgradeButtonStroke = 1;
        const upgradeButtonHeght = 30;
        const upgradeButtonWidth = 120;
        this.ui.upgradeAutoButton =
            this.addElement(
                this.scene.add.rectangle(
                    titleX + 150,
                    upgradeY - 15 / 2 + 1,
                    upgradeButtonWidth,
                    upgradeButtonHeght,
                    0x335533
                )
                .setOrigin(0)
                .setStrokeStyle(
                    upgradeButtonStroke,
                    0x66aa66
                )
                .setInteractive()
            );

        // Click action
        this.ui.upgradeAutoButton.on(
            'pointerdown',
            this._actionHandler
        );

        this.ui.upgradeAutoButtonText =
            this.addElement(
                addText(this.scene,
                    titleX + 150 + upgradeButtonWidth / 2,
                    upgradeY,
                    'UPGRADE',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5, 0)
        );
    
            this.ui.upgradeAutoStatusLabel =
            this.addElement(
                addText(this.scene,
                    titleX + 150 + 150 + upgradeButtonWidth / 2,
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
                    titleX + 150 + 150 + this.ui.upgradeAutoStatusLabel.width + upgradeButtonWidth / 2,
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
                    titleX + 150 + 150 + 150 + this.ui.upgradeAutoStatusLabel.width + upgradeButtonWidth / 2,
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
        
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // Accessed from StageCard
    //update(data = {}) {}

    // Runs from StageCard
    updateAvailability(state) {

        this.ui.upgradeAutoStatus.setText('Inactive');
        this.ui.upgradeAutoStatus.setColor('#ff6666');
        this.ui.upgradeAutoLevel.setVisible(false);
        
        // ENABLED (auto active)
        if (state === 'enabled') {
            this.ui.upgradeAutoStatus.setColor('#66ff66');
            this.ui.upgradeAutoStatus.setText('Active');
            this.ui.upgradeAutoLevel.setVisible(true);
            this.ui.upgradeAutoLevel.setText('Level: ' + this.level);
        }
        
        // ACTIVE
        if (state === 'active' || state === 'enabled') {
            this.ui.upgradeAutoButton
                ?.setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66);
            this.ui.upgradeAutoButtonText
                ?.setColor('#ffffff');
            
            return;
        } 
        
        // UNLOCKED
        if (state === 'unlocked') {
            this.ui.upgradeAutoButton
                ?.setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66);
            this.ui.upgradeAutoButtonText
                ?.setColor('#ffffff');

            return;
        }
        
        // LOCKED
        this.ui.upgradeAutoButton
            ?.setFillStyle(0x222222)
            .setStrokeStyle(1, 0x555555);
        this.ui.upgradeAutoButtonText
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
    }
}