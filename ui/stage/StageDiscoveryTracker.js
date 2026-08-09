import { listenToEvent } from '../../utils/stageHelpers.js';

export default class StageDiscoveryTracker {

    constructor(scene, stageProgress, stageItems, options = {}) {
        this.scene = scene;
        this.stageProgress = stageProgress;
        this.stageItems = stageItems;

        this.container = options.container ?? scene.add.container();
        
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.height = options.height ?? 200;

        this.depth =
            this.scene.depths?.tracker ?? 10;

        this.requirements = [];

        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                () => {
                    this.refresh();
                }
            );

        this.create();
        this.refresh();
    }

    create() {
        // Background
        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0);
            
        // Title
        this.title =
            addText(this.scene,
                this.x + 10,
                this.y + 10,
                '',
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);
        
        // Description
        this.description =
            addText(this.scene,
                this.x + 10,
                this.y + 40,
                '',
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);

        // Objectives label
        this.objectiveText =
            addText(this.scene,
                this.x + 10,
                this.y + 70,
                '',
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0);

        // Requirements
        this.totalLabel =
            addText(this.scene,
                this.x + 10,
                this.y + 165,
                '',
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            );
        
        this.totalBarBg =
            this.scene.add.rectangle(
                this.x + 10,
                this.y + 190,
                this.width - 20,
                12,
                0x222222
            )
            .setOrigin(0);
        
        this.totalBarFill =
            this.scene.add.rectangle(
                this.x + 10,
                this.y + 190,
                0,
                12,
                0x44aa44
            )
            .setOrigin(0);

        // Add to container
        this.container.add([
            this.background,
            this.title,
            this.description,
            this.objectiveText,
            this.totalLabel,
            this.totalBarBg,
            this.totalBarFill
        ]);
    }

    refresh() {
        const discovery = this.getTrackedDiscovery();
    
        if (!discovery) {
            this.clearRequirements();
            this.title.setText('No Active Discovery');
            this.description.setText('');
            return;
        }
    
        if (this.currentDiscovery?.id !== discovery.id) {
    
            this.currentDiscovery = discovery;
    
            this.title.setText(discovery.title);
            this.description.setText(
                `"${discovery.description}"`
            );
    
            this.buildRequirements(discovery);
        }
    
        this.updateRequirementProgress();
    }

    clearRequirements() {
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
    
        this.requirements = [];
        this.currentDiscovery = null;
    
        this.totalLabel.setVisible(false);
        this.totalBarBg.setVisible(false);
        this.totalBarFill.setVisible(false);
    }

    getDiscoveryProgress(discovery) {
        const requirements =
            Object.entries(
                discovery.requirements ?? {}
            );
    
        if (requirements.length === 0) {
            return 1;
        }
    
        let current = 0;
        let needed = 0;
    
        requirements.forEach(([id, amount]) => {
    
            current += Math.min(
                this.stageProgress.get(id),
                amount
            );
    
            needed += amount;
        });
    
        return current / needed;
    }

    getCurrentDiscovery() {
        return stageItems.find(item =>
            item.discovery &&
            !this.stageProgress.isDiscovered(item.id) &&
            this.stageProgress.getUnlocked(item.id)
        );
    }

    getTrackedDiscovery() {
        return this.stageItems.find(item =>
            item.discovery &&
            !this.stageProgress.isDiscovered(item.id) &&
            (
                item.startsUnlocked ||
                this.stageProgress.getUnlocked(item.id)
            )
        );
    }

    buildRequirements(discovery) {
        // Destroy previous requirements
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
        this.requirements = [];

        let y = this.y + 95;
        
        const textX = this.x + 10;
        
        const barX = this.x + this.width / 2;
        const barWidth = this.width - barX + this.x - 10;
        const barHeight = 8;
    
        let currentTotal = 0;
        let requiredTotal = 0;
        Object.entries(discovery.requirements ?? {})
            .forEach(([id, required]) => {
    
                const amount =
                    this.stageProgress.get(id);
    
                const current =
                    Math.min(amount, required);
    
                currentTotal += current;
                requiredTotal += required;
    
                const ready =
                    amount >= required;
                
                const findTitle = this.stageItems.find(i => i.id === id);
                if (!findTitle && !discovery.startsUnlocked) console.warn(`Item requirements title not found for: ${discovery[id]}`);
                const title = findTitle ? findTitle.title : id;

                const reqText = discovery.startsUnlocked ? 'Initial Discovery ✓' : `${title}: ${amount}/${required} ${ready ? '✓' : '✕'}`;
    
                const text = addText(this.scene,
                    textX,
                    y,
                    reqText,
                    {
                        fontSize: '16px',
                        color: ready ? '#66ff66' : '#ff6666'
                    }
                );
                
                const barBg = this.scene.add.rectangle(
                    barX,
                    y + 5,
                    barWidth,
                    barHeight,
                    0x222222
                ).setOrigin(0);
                
                const barFill = this.scene.add.rectangle(
                    barX,
                    y + 5,
                    barWidth * Phaser.Math.Clamp(amount / required, 0, 1),
                    barHeight,
                    ready ? 0x44aa44 : 0xaa8844
                ).setOrigin(0);
                
                this.container.add([
                    text,
                    barBg,
                    barFill
                ]);
            
                this.requirements.push({
                    id,
                    required,
                    title,
                    text,
                    barBg,
                    barFill
                });
                
                y += 22;
            });
    
        const percent =
            requiredTotal === 0
                ? 1
                : currentTotal / requiredTotal;

            this.totalY = y;
            this.totalLabel.setPosition(this.x + 10, this.totalY + 8);
            this.totalBarBg.setPosition(this.x + 10, this.totalY + 30);
            this.totalBarFill.setPosition(this.x + 10, this.totalY + 30);
    
            this.updateTotalBar(percent, y);
        }
    
    updateTotalBar(percent) {
    
        this.totalLabel.setText(
            `TOTAL PROGRESS ${Math.floor(percent * 100)}%`
        );
    
        this.totalBarFill.width =
            (this.width - 20) * percent;
    }

    updateRequirementProgress() {
    
        let currentTotal = 0;
        let requiredTotal = 0;
    
        const barWidth =
            this.width / 2 - 10;
    
        this.requirements.forEach(req => {
    
            const amount =
                Math.max(0, this.stageProgress.get(req.id) ?? 0);
    
            const current =
                Math.min(amount, req.required);
    
            currentTotal += current;
            requiredTotal += req.required;
    
            const ready =
                amount >= req.required;

            const noRequirement = req.required === 0;
            const displayAmount = Math.min(amount, req.required);
            const reqText = noRequirement
                ? 'Initial Discovery ✓'
                : `${req.title}: ${Math.floor(displayAmount)}/${req.required} ${ready ? '✓' : '✕'}`;
            req.text.setText(reqText);
    
            req.text.setColor(
                ready ? '#66ff66' : '#ff6666'
            );
    
            req.barFill.width =
                noRequirement
                    ? 0
                    : barWidth *
                      Phaser.Math.Clamp(
                          amount / req.required,
                          0,
                          1
                      );
    
            req.barFill.setFillStyle(
                ready ? 0x44aa44 : 0xaa8844
            );
        });
        
        const completed =
            requiredTotal > 0 &&
            currentTotal >= requiredTotal;

        this.requirements.forEach(req => {
            const noRequirement = req.required === 0;
            req.barBg.setVisible(!completed && !noRequirement);
            req.barFill.setVisible(!completed && !noRequirement);
        });

        this.totalLabel.setVisible(true);
        this.totalBarBg.setVisible(true);
        this.totalBarFill.setVisible(true);
    
        this.updateTotalBar(
            requiredTotal === 0
                ? 1
                : currentTotal / requiredTotal
        );
    }

    destroy() {
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
    
        this.background?.destroy();
        this.title?.destroy();
        this.description?.destroy();
        this.objectiveText?.destroy();
    
        this.totalLabel?.destroy();
        this.totalBarBg?.destroy();
        this.totalBarFill?.destroy();
    
        this.container?.destroy();
    
        this.requirements = [];
    }
}