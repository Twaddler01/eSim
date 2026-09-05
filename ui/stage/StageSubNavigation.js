export default class StageSubNavigation {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 900;
        this.height = options.height ?? 50;

        this.tabs = options.tabs ?? [];

        this.activeTab = null;
        this.tabBackgrounds = [];

        this.container =
            this.scene.add.container(
                this.x,
                this.y
            );

        this.create();
    }

    create() {

        if (!this.tabs.length) {
            return;
        }

        const tabWidth =
            this.width / this.tabs.length;

        this.tabs.forEach((tab, index) => {

            const x =
                index * tabWidth;

            const locked =
                tab.availability === 'locked';

            const background =
                this.scene.add.rectangle(
                    x,
                    0,
                    tabWidth,
                    this.height,
                    locked
                        ? 0x111111
                        : 0x222222
                )
                .setOrigin(0)
                .setStrokeStyle(
                    1,
                    0xffffff
                );

            // Only interactive when unlocked
            if (!locked) {
                background.setInteractive();
            }

            this.tabBackgrounds.push({
                id: tab.id,
                background,
                locked
            });

            const text =
                addText(
                    this.scene,
                    x + tabWidth / 2,
                    this.height / 2,
                    tab.label,
                    {
                        fontSize: '18px',
                        color: locked
                            ? '#666666'
                            : '#ffffff'
                    }
                )
                .setOrigin(0.5);

            this.container.add([
                background,
                text
            ]);

            // Only add handler to unlocked tabs
            if (!locked) {
                background.on(
                    'pointerdown',
                    () => {

                        this.setActiveTab(tab.id);

                        this.scene.events.emit(
                            'stage-sub-tab-changed',
                            tab.id
                        );

                    }
                );
            }
        });
    }

    setActiveTab(id) {

        const tab =
            this.tabBackgrounds.find(
                tab => tab.id === id
            );

        // Don't activate locked tab
        if (tab?.locked) {
            return;
        }

        this.activeTab = id;

        this.tabBackgrounds.forEach(tab => {

            if (tab.locked) {
                tab.background.setFillStyle(
                    0x111111
                );
                return;
            }

            const active =
                tab.id === id;

            tab.background.setFillStyle(
                active
                    ? 0x444444
                    : 0x222222
            );

        });
    }

    setTabs(tabs) {

        this.container.removeAll(true);

        this.tabs = tabs ?? [];

        this.tabBackgrounds = [];

        if (!this.tabs.length) {
            this.container.setVisible(false);
            return;
        }

        this.container.setVisible(true);

        this.create();
    }

    destroy() {
        this.container?.destroy();
    }
}