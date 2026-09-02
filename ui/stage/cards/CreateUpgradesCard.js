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

        this.canAction = options.canAction ?? (() => false);
        this.onAction = options.onAction ?? null;
        
        // Data
        this.getReqData = options.getReqData ?? (() => null);

        this._actionHandler = () => {
            const reqs = this.getReqData();

            if (reqs && !reqs.allMet) {
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
        
        const reqData = this.getReqData();

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
                    reqData?.buttonFill
                )
                .setOrigin(0, 0.5)
                .setStrokeStyle(
                    upgradeButtonStroke,
                    reqData?.buttonStroke
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
                        color: reqData?.buttonTextColor
                    }
                )
            .setOrigin(0.5, 0)
        );

        if (reqData.noReq) return;
        
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

        reqData.requirements.forEach(item => {
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

    // Started from StageCard
    update() {
        const data = {
            level: this.getLevel(),
            reqData: this.getReqData()
        };
    
        this.updateUI(data);
    }

    updateUI(data) {
        this.ui.upgradeAutoLevel.setText('Level: ' + data.level);
        
        // Update requirements
        this.updateRequirements(data.reqData);

        // For status and purchase button
        this.updateAvailability(data);

        this.updateLockUI(data.reqData.unlocked);
    }

    updateRequirements(reqData) {
        if (!reqData || !this.ui.upgradeRequirements) {
            return;
        }
    
        reqData.requirements.forEach((item, index) => {
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
    updateAvailability(data) {
        if (!data) return;
        
        if (data.reqData) {
            const enabled = data.reqData.upgradeStatus === 'enabled';
            const upgradeStatus = {
                text: enabled ? 'Active' : 'Inactive',
                color: enabled ? '#66ff66' : '#ff6666',
                visible: enabled ? true : false
            };

            this.ui.upgradeAutoStatus.setText(upgradeStatus.text);
            this.ui.upgradeAutoStatus.setColor(upgradeStatus.color);
            this.ui.upgradeAutoLevel.setVisible(upgradeStatus.visible);
      
            this.ui.upgradeAutoButton
                ?.setFillStyle(data.reqData.buttonFill)
                .setStrokeStyle(1, data.reqData.buttonStroke);
            this.ui.upgradeAutoButtonText
                ?.setColor(data.reqData.buttonTextColor);
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