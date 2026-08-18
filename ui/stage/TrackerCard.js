export default class TrackerCard {

    constructor(scene, options = {}) {
        this.scene = scene;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.container = this.scene.add.container(this.x, this.y);
        this.width = options.width ?? 300;

        this.objective = options.objective ?? null;

        this.stageProgress = options.stageProgress ?? null;

        this.onUntrack = options.onUntrack ?? null;
        
        this.unlocksItems = options.unlocksItems ?? null;

        this.height = 0;

        this.requirements = [];
        this.childEntries = [];

        this.objectiveTextDisplay = null;
        this.progressTextOverall = null;

        // Progress bar
        this.progressBar = null;
        this.progressFill = null;
        this.progressText = null;

        // Complete button
        this.completeButton = null;
        this.completeButtonText = null;

        this.create();
        this.update();
    }

    // CREATE
    create() {
        this.background =
            this.scene.add.rectangle(
                0,
                0,
                this.width,
                100,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(
                1,
                0x000000
            );

        // TITLE
        this.titleText =
            addText(
                this.scene,
                10,
                10,
                this.objective.title,
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            );

        // DESCRIPTION
        this.descriptionText =
            addText(
                this.scene,
                10,
                36,
                this.objective.description ?? '',
                {
                    fontSize: '14px',
                    color: '#cccccc',
                    wordWrap: {
                        width: this.width - 20
                    }
                }
            );

        let currentY =
            36 +
            this.descriptionText.height +
            8;

        // PARENT OBJECTIVE
        if (this.objective.type === 'parent') {
            currentY =
                this.createParentDisplay(
                    currentY
                );
        }
        // NORMAL OBJECTIVE
        else {

            currentY =
                this.createRequirementDisplay(
                    currentY
                );
        }

        // Progress bar
        const progressY = currentY + 4;
        
        this.progressBar =
            this.scene.add.rectangle(
                10,
                progressY,
                this.width - 20,
                12,
                0x222222
            )
            .setOrigin(0);
        
        this.progressFill =
            this.scene.add.rectangle(
                10,
                progressY,
                0,
                12,
                0x66aa66
            )
            .setOrigin(0);
        
        this.progressText =
            addText(
                this.scene,
                10,
                progressY + 16,
                '',
                {
                    fontSize: '13px',
                    color: '#ffffff'
                }
            );
        
        currentY =
            progressY +
            34 + 17;

        // Unlocks Objectives
        if (this.unlocksItems.objectives.length > 0) {
            this.unlocksObjTextTitle =
                addText(
                    this.scene,
                    10,
                    currentY,
                    'Unlocks Objectives:',
                    {
                        fontSize: '15px',
                        color: '#66ff99'
                    }
                )
                .setOrigin(0);
        
            currentY += this.unlocksObjTextTitle.height + 5;
        
            this.unlocksObjText =
                addText(
                    this.scene,
                    15,
                    currentY,
                    this.unlocksItems.objectives.map(obj => `- ${obj}`).join('\n'),
                    {
                        fontSize: '15px',
                        color: '#ffffff'
                    }
                )
                .setOrigin(0);
        
            currentY += this.unlocksObjText.height + 10;
        }
        
        // Unlocks items
        if (this.unlocksItems.items.length > 0) {
            this.unlocksItemsTextTitle =
                addText(
                    this.scene,
                    10,
                    currentY,
                    'Unlocks Items:',
                    {
                        fontSize: '15px',
                        color: '#66ff99'
                    }
                )
                .setOrigin(0);
        
            currentY += this.unlocksItemsTextTitle.height + 5;
        
            this.unlocksItemsText =
                addText(
                    this.scene,
                    15,
                    currentY,
                    this.unlocksItems.items.map(item => `- ${item}`).join('\n'),
                    {
                        fontSize: '15px',
                        color: '#ffffff'
                    }
                )
                .setOrigin(0);
        
            currentY += this.unlocksItemsText.height + 10;
        }
        
        // Complete button
        this.completeButton =
            this.scene.add.rectangle(
                10,
                currentY,
                this.width - 20,
                34,
                0x335533
            )
            .setOrigin(0)
            .setStrokeStyle(
                1,
                0x66aa66
            )
            .setInteractive({
                useHandCursor: true
            });
        
        this.completeButtonText =
            addText(
                this.scene,
                this.width / 2,
                currentY + 17,
                'COMPLETE',
                {
                    fontSize: '15px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5);
        
        this.completeButton.on(
            'pointerdown',
            () => {
        
                this.stageProgress.completeObjective(
                    this.objective.id
                );
            }
        );
        
        currentY += 34 + 10;

        // FINAL HEIGHT
        this.height = currentY + 10;

        this.background.setSize(
            this.width,
            this.height
        );

        const children = [
            this.background,
            this.titleText,
            this.descriptionText,
            this.progressBar,
            this.progressFill,
            this.progressText,
            this.completeButton,
            this.completeButtonText,
            this.unlocksItemsTextTitle,
            this.unlocksObjTextTitle,
            this.unlocksItemsText,
            this.unlocksObjText,
            this.objectiveTextDisplay,
            this.progressTextOverall,
            ...this.requirements.map(
                requirement => requirement.text
            ),
            ...this.childEntries.map(
                entry => entry.text
            )
        ].filter(Boolean);
        
        this.container.add(children);
    }

    // NORMAL REQUIREMENTS
    createRequirementDisplay(currentY) {
        // Special objective text
        if (this.objective.objectiveText) {
            this.objectiveTextDisplay =
                addText(
                    this.scene,
                    10,
                    currentY,
                    this.objective.objectiveText,
                    {
                        fontSize: '14px',
                        color: '#ffffff',
                        wordWrap: {
                            width: this.width - 20
                        }
                    }
                );

            currentY +=
                this.objectiveTextDisplay.height +
                8;
        }

        // Item requirements
        const itemRequirements =
            this.objective.requirements?.items ?? [];

        itemRequirements.forEach(
            requirement => {

                Object.entries(requirement)
                    .forEach(
                        ([id, required]) => {

                            const text =
                                addText(
                                    this.scene,
                                    10,
                                    currentY,
                                    '',
                                    {
                                        fontSize: '14px',
                                        color: '#ffffff'
                                    }
                                );


                            this.requirements.push({
                                id,
                                required,
                                text
                            });


                            currentY += 20;
                        }
                    );
            }
        );

        return currentY;
    }

    // PARENT DISPLAY
    createParentDisplay(currentY) {
        const children =
            this.objective.children ?? [];

        // Overall progress
        this.progressTextOverall =
            addText(
                this.scene,
                10,
                currentY,
                '',
                {
                    fontSize: '14px',
                    color: '#ffffff'
                }
            );

        currentY +=
            22;

        // Parent item requirements
        const itemRequirements =
            this.objective.requirements?.items ?? [];
    
        itemRequirements.forEach(
            requirement => {
                Object.entries(requirement)
                    .forEach(
                        ([id, required]) => {
    
                            const text =
                                addText(
                                    this.scene,
                                    10,
                                    currentY,
                                    '',
                                    {
                                        fontSize: '14px',
                                        color: '#ffffff'
                                    }
                                );
    
                            this.requirements.push({
                                id,
                                required,
                                text
                            });
    
                            currentY += 20;
                        }
                    );
            }
        );

        // Individual children
        children.forEach(
            childId => {

                const child =
                    this.stageProgress.getObjective(
                        childId
                    );

                if (!child) {
                    return;
                }


                const text =
                    addText(
                        this.scene,
                        10,
                        currentY,
                        '',
                        {
                            fontSize: '14px',
                            color: '#ffffff'
                        }
                    );


                this.childEntries.push({
                    id: childId,
                    objective: child,
                    text
                });


                currentY += 20;
            }
        );

        return currentY;
    }

    // UPDATE
    update() {
        const progress =
            this.stageProgress.getObjectiveProgressData(
                this.objective.id
            );
    
        // Complete button
        if (progress.ready) {
    
            this.completeButton
                .setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66)
                .setInteractive({
                    useHandCursor: true
                });
    
            this.completeButtonText
                .setColor('#ffffff')
                .setText('COMPLETE');
    
        } else {
    
            this.completeButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x000000)
                .disableInteractive();
    
            this.completeButtonText
                .setColor('#555555')
                .setText('INCOMPLETE');
        }
    
        // Progress bar
        this.progressFill.width =
            (this.width - 20) *
            progress.percent;
    
        if (progress.total > 0) {
            this.progressText.setText(
                `${progress.completed} / ${progress.total}`
            );
        } else {
            this.progressText.setText(
                'Ready to complete'
            );
        }
    
        // Objective-specific display
        if (this.objective.type === 'parent') {
            this.updateParent();
        } else {
            this.updateRequirements();
        }
    }

    // UPDATE NORMAL REQUIREMENTS
    updateRequirements() {
        this.requirements.forEach(
            requirement => {

                const amount =
                    this.stageProgress.get(
                        requirement.id
                    );


                const ready =
                    amount >= requirement.required;


                const item =
                    this.stageProgress.getItem(
                        requirement.id
                    );


                const title =
                    item?.title ??
                    requirement.id;


                requirement.text.setText(
                    `${title}: ` +
                    `${Math.floor(amount)} / ` +
                    `${requirement.required} ` +
                    `${ready ? '✓' : '✕'}`
                );


                requirement.text.setColor(
                    ready
                        ? '#66ff66'
                        : '#ff6666'
                );
            }
        );
    }

    // UPDATE PARENT
    updateParent() {
        const progress =
                this.stageProgress.getObjectiveProgressData(
                    this.objective.id
                );

        if (!progress) {
            return;
        }

        // Overall parent progress
        this.progressTextOverall.setText(
            `Progress: ` +
            `${progress.completed} / ` +
            `${progress.total}`
        );


        this.progressTextOverall.setColor(
            progress.completed >= progress.total
                ? '#66ff66'
                : '#ffffff'
        );

        // Parent item requirements
        this.updateRequirements();

        // Children
        this.childEntries.forEach(
            entry => {

                const completed =
                    this.stageProgress.isObjectiveComplete(
                        entry.id
                    );


                entry.text.setText(
                    `${completed ? '✓' : '✕'} ` +
                    `${entry.objective.title}`
                );


                entry.text.setColor(
                    completed
                        ? '#66ff66'
                        : '#ff6666'
                );
            }
        );
    }

    // DESTROY
    destroy() {

        this.container?.destroy();

        this.requirements = [];
        this.childEntries = [];

        this.objectiveTextDisplay = null;
        this.progressTextOverall = null;

        this.container = null;
    }
}