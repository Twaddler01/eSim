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
        this.onAction = options.onAction ?? null;

        this._actionHandler = () => {
            this.onAction?.(this.item);
        };

        this.elements = [];
        this.ui = {};

        this.create();
        this.update();
    }

    create() {
        // Title and overlay integrated already
        const titleX = this.x + 5;
        let upgradeY = this.y + 24.265625 + 20;
    
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
        upgradeY += this.ui.upgradeAutoLabel.height + 5;
        const upgradeButtonStroke = 1;
        const upgradeButtonHeght = 30;
        this.ui.upgradeAutoButton =
            this.addElement(
                this.scene.add.rectangle(
                    titleX,
                    upgradeY,
                    120,
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
                    titleX + 60,
                    upgradeY + 15/2,
                    'UPGRADE',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5, 0)
        );
        
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    update(data = {}) {
        // Amount of item this upgrade modifies
        if ('amount' in data) {
            this.amount = data.amount;
        }

        // 'active' or 'locked'
        if ('availability' in data) {
            this.availability = data.availability;
        }
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