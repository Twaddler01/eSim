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

        // Tab data
        this.tabs = options.tabs ?? [];

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
        this.tabs.forEach(
            (tab, index) => {
                this.createButton(
                    tab.title,
                    index,
                    tab.id
                );
            }
        );

        // Apply initial state
        this.setTabs(this.tabs);
    }


    // --------------------------------------------------
    // Update tab data/state
    // --------------------------------------------------

    setTabs(tabs = []) {

        this.tabs = tabs;

        this.buttons.forEach(button => {

            const tab =
                tabs.find(tab =>
                    tab.id === button.id
                );

            if (!tab) return;

            const locked =
                tab.availability === 'locked';

            button.locked = locked;

            // Visual state
            if (locked) {

                button.background
                    .setFillStyle(0x111111);

                button.label
                    .setColor('#666666');

            } else {

                button.background
                    .setFillStyle(
                        button.id === this.activeTab
                            ? 0x444444
                            : 0x222222
                    );

                button.label
                    .setColor('#ffffff');
            }

            // Interaction
            if (locked) {
                button.background.disableInteractive();
            } else {
                button.background.setInteractive();
            }
        });
    }


    // --------------------------------------------------
    // Active tab
    // --------------------------------------------------

    setActiveTab(id) {

        const tab =
            this.tabs.find(tab =>
                tab.id === id
            );

        // Don't activate locked tabs
        if (
            tab &&
            tab.availability === 'locked'
        ) {
            return;
        }

        this.activeTab = id;

        this.buttons.forEach(tab => {

            if (tab.locked) {
                tab.background.setFillStyle(
                    0x111111
                );
                return;
            }

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
            addText(
                this.scene,
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

            const tab =
                this.tabs.find(tab =>
                    tab.id === id
                );

            // Locked tab does nothing
            if (
                tab?.availability === 'locked'
            ) {
                return;
            }

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
            label: buttonLabel,
            locked: false
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