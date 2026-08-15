export default class TrackerCard {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.x =
            options.x ?? 0;

        this.y =
            options.y ?? 0;

        this.container =
            this.scene.add.container(
                this.x,
                this.y
            );
    
        this.width =
            options.width ?? 300;

        this.objective =
            options.objective ?? null;

        this.stageProgress =
            options.stageProgress ?? null;

        this.onUntrack =
            options.onUntrack ?? null;

        this.height = 0;

        this.requirements = [];

        this.create();
        this.update();
    }

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

            this.objectiveTextDisplay = null;
            
            let currentY =
                36 +
                this.descriptionText.height +
                8;
            
            // Requirements exception
            if (this.objective.objectiveText) {
            
                this.objectiveTextDisplay =
                    addText(
                        this.scene,
                        10,
                        currentY,
                        this.objective.objectiveText,
                        {
                            fontSize: '14px',
                            color: '#ffffff'
                        }
                    );
            
                currentY +=
                    this.objectiveTextDisplay.height +
                    8;
            }

        // Requirements
        const itemRequirements =
            this.objective.requirements?.items ?? [];

        itemRequirements.forEach(
            requirement => {

                Object.entries(requirement)
                    .forEach(([id, required]) => {

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
                    });
            }
        );

        this.height =
            currentY;

        this.background.setSize(
            this.width,
            this.height
        );

        this.container.add([
            this.background,
            this.titleText,
            this.descriptionText,
        
            ...(this.objectiveTextDisplay
                ? [this.objectiveTextDisplay]
                : []),
        
            ...this.requirements.map(
                requirement =>
                    requirement.text
            )
        ]);
    }

update() {
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

    destroy() {
        this.container?.destroy();
        this.requirements = [];
        this.container = null;
    }
}