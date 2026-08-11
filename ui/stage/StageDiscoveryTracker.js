import { listenToEvent } from '../../utils/stageHelpers.js';

export default class StageDiscoveryTracker {

    constructor(scene, stageProgress, stageItems, masterObjectives, options = {}) {
        this.scene = scene;
        this.stageProgress = stageProgress;
        this.stageItems = stageItems;
        this.masterObjectives = masterObjectives;

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

    buildRequirements(objective) {
    
        this.totalLabel.setVisible(true);
        this.totalBarBg.setVisible(true);
        this.totalBarFill.setVisible(true);
    
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
    
        this.requirements = [];
    
        let y = this.y + 95;
    
        const textX = this.x + 10;
    
        const barX =
            this.x + this.width / 2;
    
        const barWidth =
            this.width - barX + this.x - 10;
    
        const barHeight = 8;
    
        let currentTotal = 0;
        let requiredTotal = 0;
    
        objective.objectives.forEach(requirement => {
    
            let current = 0;
            let required = 1;
    
            if (requirement.type === 'discovery') {
    
                current =
                    this.stageProgress.isDiscovered(
                        requirement.id
                    ) ? 1 : 0;
    
                required = 1;
            }
    
            if (requirement.type === 'resource') {
    
                current =
                    this.stageProgress.get(
                        requirement.id
                    ) ?? 0;
    
                required =
                    requirement.amount;
            }
    
            const cappedCurrent =
                Math.min(current, required);
    
            const ready =
                current >= required;
    
            currentTotal += cappedCurrent;
            requiredTotal += required;
    
            const item =
                this.stageItems.find(
                    i => i.id === requirement.id
                );
    
            const title =
                item?.title ??
                requirement.id;
    
            const displayAmount =
                requirement.type === 'discovery'
                    ? ready
                        ? '✓'
                        : '✕'
                    : `${Math.floor(cappedCurrent)}/${required}`;
    
            const reqText =
                `${title}: ${displayAmount} ` +
                `${ready ? '✓' : '✕'}`;
    
            const text =
                addText(
                    this.scene,
                    textX,
                    y,
                    reqText,
                    {
                        fontSize: '16px',
                        color:
                            ready
                                ? '#66ff66'
                                : '#ff6666'
                    }
                );
    
            const barBg =
                this.scene.add.rectangle(
                    barX,
                    y + 5,
                    barWidth,
                    barHeight,
                    0x222222
                )
                .setOrigin(0);
    
            const barFill =
                this.scene.add.rectangle(
                    barX,
                    y + 5,
                    barWidth *
                        Phaser.Math.Clamp(
                            current / required,
                            0,
                            1
                        ),
                    barHeight,
                    ready
                        ? 0x44aa44
                        : 0xaa8844
                )
                .setOrigin(0);
    
            this.container.add([
                text,
                barBg,
                barFill
            ]);
    
            this.requirements.push({
                id: requirement.id,
                type: requirement.type,
                required,
                title,
                text,
                barBg,
                barFill
            });
    
            y += 22;
        });
    
        this.totalY = y;
    
        this.totalLabel.setPosition(
            this.x + 10,
            this.totalY + 8
        );
    
        this.totalBarBg.setPosition(
            this.x + 10,
            this.totalY + 30
        );
    
        this.totalBarFill.setPosition(
            this.x + 10,
            this.totalY + 30
        );
    
        const percent =
            requiredTotal === 0
                ? 1
                : currentTotal / requiredTotal;
    
        this.updateTotalBar(percent);
    }

    buildMasterRequirements(master) {
        this.totalLabel.setVisible(true);
        this.totalBarBg.setVisible(true);
        this.totalBarFill.setVisible(true);
    
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
    
        this.requirements = [];
    
        let y =
            this.y + 95;
    
        const textX =
            this.x + 10;
    
        const barX =
            this.x + this.width / 2;
    
        const barWidth =
            this.width / 2 - 10;
    
        const barHeight = 8;
    
        master.objectives.forEach(id => {
    
            const item =
                this.stageItems.find(
                    item => item.id === id
                );
    
            const title =
                item?.title ??
                id;
    
            const text =
                addText(
                    this.scene,
                    textX,
                    y,
                    '',
                    {
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                );
    
            const barBg =
                this.scene.add.rectangle(
                    barX,
                    y + 5,
                    barWidth,
                    barHeight,
                    0x222222
                )
                .setOrigin(0);
    
            const barFill =
                this.scene.add.rectangle(
                    barX,
                    y + 5,
                    0,
                    barHeight,
                    0xaa8844
                )
                .setOrigin(0);
    
            this.container.add([
                text,
                barBg,
                barFill
            ]);
    
            this.requirements.push({
                id,
                type: 'discovery',
                required: 1,
                title,
                text,
                barBg,
                barFill
            });
    
            y += 22;
        });
    
        this.totalY = y;
    
        this.totalLabel.setPosition(
            this.x + 10,
            this.totalY + 8
        );
    
        this.totalBarBg.setPosition(
            this.x + 10,
            this.totalY + 30
        );
    
        this.totalBarFill.setPosition(
            this.x + 10,
            this.totalY + 30
        );
    
        this.updateMasterRequirementProgress();
    }

    refresh() {
        const master =
            this.stageProgress.getActiveMasterObjective();
    
        if (master) {
            this.refreshMasterObjective(master);
            return;
        }
    
        const objective =
            this.getTrackedObjective();
    
        if (!objective) {
            this.clearRequirements();
    
            this.title.setText('No Active Discovery');
            this.description.setText('');
            this.objectiveText.setText('');
    
            return;
        }
    
        if (this.currentDiscovery?.id !== objective.id) {
    
            this.currentDiscovery = objective;
    
            this.title.setText(objective.title);
    
            this.description.setText(
                `"${objective.description}"`
            );
    
            this.objectiveText.setText('CURRENT DISCOVERY');
    
            this.buildRequirements(objective);
        }
    
        this.updateRequirementProgress();
    }

    refreshMasterObjective(master) {
        // Master objective changed
        if (
            this.currentMasterObjective?.id !==
            master.id
        ) {
            this.clearRequirements();
    
            this.currentMasterObjective =
                master;
    
            this.currentDiscovery = null;
    
            this.title.setText(
                master.title
            );
    
            this.description.setText(
                `"${master.description ?? ''}"`
            );
    
            this.objectiveText.setText(
                'MASTER OBJECTIVE'
            );
    
            this.buildMasterRequirements(
                master
            );
        }
    
        this.updateMasterRequirementProgress();
    }

    updateMasterRequirementProgress() {
    
        let completed = 0;
    
        const total =
            this.requirements.length;
    
        this.requirements.forEach(req => {
    
            const complete =
                this.stageProgress.isDiscovered(
                    req.id
                );
    
            if (complete) {
                completed++;
            }
    
            req.text.setText(
                `${req.title}: ` +
                `${complete ? '✓' : '○'}`
            );
    
            req.text.setColor(
                complete
                    ? '#66ff66'
                    : '#ffffff'
            );
    
            req.barFill.width =
                complete
                    ? req.barBg.width
                    : 0;
    
            req.barFill.setFillStyle(
                complete
                    ? 0x44aa44
                    : 0xaa8844
            );
        });
    
        const percent =
            total === 0
                ? 1
                : completed / total;
    
        this.updateTotalBar(percent);
    }

    clearRequirements() {
        this.requirements.forEach(req => {
            req.text?.destroy();
            req.barBg?.destroy();
            req.barFill?.destroy();
        });
    
        this.requirements = [];
        this.currentDiscovery = null;
        this.currentMasterObjective = null;
    
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

    isMasterObjectiveComplete(objective) {
    
        return objective.objectives.every(id =>
            this.stageProgress.isDiscovered(id)
        );
    }

    getTrackedObjective() {
        const stage =
            this.stageProgress.getCurrentStageId();
    
        return this.masterObjectives.find(objective =>
            objective.stage === stage &&
            !this.isMasterObjectiveComplete(objective)
        ) ?? null;
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
    
            let amount = 0;
    
            if (req.type === 'discovery') {
    
                amount =
                    this.stageProgress.isDiscovered(
                        req.id
                    ) ? 1 : 0;
            }
    
            if (req.type === 'resource') {
    
                amount =
                    Math.max(
                        0,
                        this.stageProgress.get(req.id) ?? 0
                    );
            }
    
            const current =
                Math.min(
                    amount,
                    req.required
                );
    
            currentTotal += current;
            requiredTotal += req.required;
    
            const ready =
                amount >= req.required;
    
            if (req.type === 'discovery') {
    
                req.text.setText(
                    `${req.title}: ` +
                    `${ready ? '✓' : '✕'}`
                );
    
            } else {
    
                req.text.setText(
                    `${req.title}: ` +
                    `${Math.floor(current)}/` +
                    `${req.required} ` +
                    `${ready ? '✓' : '✕'}`
                );
            }
    
            req.text.setColor(
                ready
                    ? '#66ff66'
                    : '#ff6666'
            );
    
            req.barFill.width =
                barWidth *
                Phaser.Math.Clamp(
                    amount / req.required,
                    0,
                    1
                );
    
            req.barFill.setFillStyle(
                ready
                    ? 0x44aa44
                    : 0xaa8844
            );
        });
    
        const percent =
            requiredTotal === 0
                ? 1
                : currentTotal / requiredTotal;
    
        this.updateTotalBar(percent);
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