export default class StageNavigation {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.x = options.x ?? 10;
        this.y = options.y ?? scene.scale.height - 70;

        this.width =
            options.width ??
            scene.scale.width - 20;

        this.height =
            options.height ?? 60;
        
        this.depth = this.scene.depths.navigation;
        
        this.create();
    }


    create() {

        // Navigation background
        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);
        this.background.setDepth(this.depth);

        // Buttons
        this.createButton(
            'GATHER',
            0,
            'gather'
        );

        this.createButton(
            'DISCOVER',
            1,
            'discover'
        );

        this.createButton(
            'MORE',
            2,
            'more'
        );
    }

    createButton(label, index, id) {
        const buttonWidth =
            this.width / 3;
    
        const x =
            this.x +
            buttonWidth * index;
    
        const y =
            this.y;
    
        // Button background
        const button =
            this.scene.add.rectangle(
                x,
                y,
                buttonWidth,
                this.height,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000)
            .setInteractive();
        button.setDepth(this.depth);
    
        // Button label
        const buttonLabel = this.scene.add.text(
            x + buttonWidth / 2,
            y + this.height / 2,
            label,
            {
                fontSize: '18px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5);
        buttonLabel.setDepth(this.depth);
    
        // Entire rectangle is clickable
        button.on(
            'pointerdown',
            () => {
    
                console.log(
                    `Stage navigation: ${id}`
                );
    
                this.scene.events.emit(
                    'stage-tab-changed',
                    id
                );
            }
        );
    
    
        return button;
    }
}