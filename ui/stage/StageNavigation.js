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

        // Event handlers
        this.tabHandlers = [];
        
        this.activeTab = null;

        // Phaser objects
        this.buttons = [];
        this.labels = [];

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
            'CREATE',
            1,
            'create'
        );

        this.createButton(
            'DISCOVER',
            2,
            'discover'
        );
    }

    setActiveTab(id) {
        this.activeTab = id;
    
        this.buttons.forEach(tab => {
    
            tab.background.setFillStyle(
                tab.id === id
                    ? 0x444444
                    : 0x222222
            );
    
        });
    }

    createButton(label, index, id) {

        const buttonWidth =
            this.width / 3;

        const x =
            this.x +
            buttonWidth * index;

        const y =
            this.y;


        // --------------------------------------------------
        // Button background
        // --------------------------------------------------

        const button =
            this.scene.add.rectangle(
                x,
                y,
                buttonWidth,
                this.height,
                0x000055
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0xffffff)
            .setInteractive();

        button.setDepth(this.depth);


        // --------------------------------------------------
        // Button label
        // --------------------------------------------------

        const buttonLabel =
            addText(this.scene,
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


        // --------------------------------------------------
        // Button event
        // --------------------------------------------------

        const handler = () => {

            this.setActiveTab(id);

            this.scene.events.emit(
                'stage-tab-changed',
                id
            );

        };


        button.on(
            'pointerdown',
            handler
        );


        // --------------------------------------------------
        // Store references
        // --------------------------------------------------

        this.tabHandlers.push({
            button,
            handler
        });

         this.buttons.push({
            id,
            background: button,
            label: buttonLabel
        });

        return button;
    }


    // --------------------------------------------------
    // Destroy
    // --------------------------------------------------

    destroy() {

        // --------------------------------------------------
        // Remove event listeners
        // --------------------------------------------------

        this.tabHandlers.forEach(
            ({ button, handler }) => {

                button.off(
                    'pointerdown',
                    handler
                );

            }
        );

        this.tabHandlers = [];


        // --------------------------------------------------
        // Destroy buttons
        // --------------------------------------------------

        this.buttons.forEach(
            tab => {
                tab.background.destroy();
                tab.label.destroy();
            }
        );

        this.buttons = [];

        // --------------------------------------------------
        // Destroy background
        // --------------------------------------------------

        this.background?.destroy();

        this.background = null;
    }
}