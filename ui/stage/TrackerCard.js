import { listenToEvent } from '../../utils/stageHelpers.js';

export default class TrackerCard {

    constructor(scene, options = {}) {
        this.scene = scene;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.container = this.scene.add.container(this.x, this.y);
        this.width = options.width ?? 300;

        this.objective = options.objective ?? null;
        this.objectiveId = this.objective?.id ?? null;

        this.objectivesManager = options.objectivesManager ?? null;
        this.unlocksItems = options.unlocksItems ?? null;
        this.objectiveFlow = options.objectiveFlow ?? null;
        
        // To disable interactions outside of scroll area
        this.scrollBox = options.scrollBox ?? null;

        this.height = 0;

        this.requirements = [];
        this.childEntries = [];

        // ALL elements (tab container)
        this.elements = [];

        this.create();
        this.update();

        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                event => {
                    if (event.id !== this.objectiveId) {
                        return;
                    }
                        // unlockObjective()
                    if (event.type === 'objective-complete'
                    ) {
                        this.update();
                    }
                }
            );
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // For scrollBox
    isPointerVisible(pointer) {
        if (!this.scrollBox) {
            return true;
        }
        return this.scrollBox.isPointerInside(pointer);
    }

    // CREATE
    create() {
        this.background =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    0,
                    this.width,
                    100,
                    0x000022
                )
                .setOrigin(0)
                .setStrokeStyle(
                    1,
                    0x000000
                )
            );

        // TITLE
        this.titleText =
            this.addElement(
                addText(
                    this.scene,
                    10,
                    10,
                    this.objective.title,
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            );

        // TRACKING
        this.trackStatus =
            this.addElement(
                addText(
                    this.scene,
                    this.width - 60,
                    5,
                    'UNTRACK',
                    {
                        fontSize: '12px',
                        color: '#ece75f'
                    }
                )
                .setInteractive({
                    useHandCursor: true
                })
            );
        
        this.trackStatus.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
        
                this.objectivesManager
                    .setObjectiveTracked(
                        this.objective.id,
                        false
                    );
            }
        );

        // DESCRIPTION
        this.descriptionText =
            this.addElement(
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
                )
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
            this.addElement(
                this.scene.add.rectangle(
                    10,
                    progressY,
                    this.width - 20,
                    12,
                    0x222222
                )
                .setOrigin(0)
            );
        
        this.progressFill =
            this.addElement(
                this.scene.add.rectangle(
                    10,
                    progressY,
                    0,
                    12,
                    0x66aa66
                )
                .setOrigin(0)
            );
        
        this.progressText =
            this.addElement(
                addText(
                    this.scene,
                    10,
                    progressY + 16,
                    '',
                    {
                        fontSize: '13px',
                        color: '#ffffff'
                    }
                )
            );
        
        currentY =
            progressY +
            34 + 17;

        // Unlocks Objectives
        if (this.unlocksItems.objectives.length > 0) {
            this.unlocksObjTextTitle =
                this.addElement(
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
                    .setOrigin(0)
                );
        
            currentY += this.unlocksObjTextTitle.height + 5;
        
            this.unlocksObjText =
                this.addElement(
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
                    .setOrigin(0)
                );
        
            currentY += this.unlocksObjText.height + 10;
        }

        // Unlocks items
        if (this.unlocksItems.items.length > 0) {
            this.unlocksItemsTextTitle =
                this.addElement(
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
                    .setOrigin(0)
                );
        
            currentY += this.unlocksItemsTextTitle.height + 5;
        
            this.unlocksItemsText =
                this.addElement(
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
                    .setOrigin(0)
                );
        
            currentY += this.unlocksItemsText.height + 10;
        }
        
        // Complete button
        this.completeButton =
            this.addElement(
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
                })
            );
        
        this.completeButtonText =
            this.addElement(
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
                .setOrigin(0.5)
            );
        
        this.completeButton.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
        
                this.objectiveFlow.completeObjective(
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
    }

    // NORMAL REQUIREMENTS
    createRequirementDisplay(currentY) {
        // Special objective text
        if (this.objective.objectiveText) {
            this.objectiveTextDisplay =
                this.addElement(
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
                    )
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
                                this.addElement(
                                    addText(
                                        this.scene,
                                        10,
                                        currentY,
                                        '',
                                        {
                                            fontSize: '14px',
                                            color: '#ffffff'
                                        }
                                    )
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
            this.addElement(
                addText(
                    this.scene,
                    10,
                    currentY,
                    '',
                    {
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                )
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
                                this.addElement(
                                    addText(
                                        this.scene,
                                        10,
                                        currentY,
                                        '',
                                        {
                                            fontSize: '14px',
                                            color: '#ffffff'
                                        }
                                    )
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
                    this.objectivesManager.getObjective(
                        childId
                    );

                if (!child) {
                    return;
                }


                const text =
                    this.addElement(
                        addText(
                            this.scene,
                            10,
                            currentY,
                            '',
                            {
                                fontSize: '14px',
                                color: '#ffffff'
                            }
                        )
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

////
        // Upon immediate objection completion
        const status =
            this.objectivesManager
                .getObjectiveStatus(
                    this.objective.id
                );
    
        if (status === 'completed') {
    
            this.completeButton
                .disableInteractive()
                .setVisible(false);
    
            this.completeButtonText
                .setColor('#66ff66')
                .setText('>> COMPLETED! <<');
    
            return;
        }
    
        // Normal active state
        this.completeButtonText?.setText('COMPLETE');

////

        const progress =
            this.objectivesManager.getObjectiveProgressData(
                this.objective.id
            );
    
        // Complete button
        if (progress.ready) {
    
            this.completeButton
                ?.setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66)
                .setInteractive({
                    useHandCursor: true
                });
    
            this.completeButtonText
                ?.setColor('#ffffff')
                .setText('COMPLETE');
    
        } else {
    
            this.completeButton
                ?.setFillStyle(0x222222)
                .setStrokeStyle(1, 0x000000)
                .disableInteractive();
    
            this.completeButtonText
                ?.setColor('#555555')
                .setText('INCOMPLETE');
        }
    
        // Progress bar
        this.progressFill.width =
            (this.width - 20) *
            progress.percent;
    
        if (progress.total > 0) {
            this.progressText?.setText(
                `${progress.completed} / ${progress.total}`
            );
        } else {
            this.progressText?.setText(
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
                    this.objectivesManager.get(
                        requirement.id
                    );


                const ready =
                    amount >= requirement.required;


                const item =
                    this.objectivesManager.getItem(
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
                this.objectivesManager.getObjectiveProgressData(
                    this.objective.id
                );

        if (!progress) {
            return;
        }

        // Overall parent progress
        this.progressTextOverall?.setText(
            `Progress: ` +
            `${progress.completed} / ` +
            `${progress.total}`
        );


        this.progressTextOverall?.setColor(
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
                    this.objectivesManager.isObjectiveComplete(
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
        this.removeObjectiveListener?.()

        this.container?.destroy();
    
        this.requirements = [];
        this.childEntries = [];
        this.elements = [];
    
        this.objectiveTextDisplay = null;
        this.progressTextOverall = null;
    
        this.completeButton = null;
        this.completeButtonText = null;
    
        this.container = null;
    }
}