export default class StageInventory {

    constructor(scene, stageProgress, stageItems, options = {}) {

        this.scene = scene;
        this.stageProgress = stageProgress;
        this.stageItems = stageItems;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;

        this.width =
            options.width ?? 300;

        this.height =
            options.height ?? 200;

        this.depth =
            this.scene.depths?.inventory ?? 10;

        this.items = [];

        this.create();

        // --------------------------------------------------
        // Listen for inventory changes
        // --------------------------------------------------

        this._changedHandler =
            (id, amount) => {

                this.refresh();

            };

        this.stageProgress.on(
            'changed',
            this._changedHandler
        );

        // Initial display
        this.refresh();
    }


    // --------------------------------------------------
    // Create
    // --------------------------------------------------

    create() {

        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0);

        this.background.setDepth(
            this.depth
        );


        // --------------------------------------------------
        // Title
        // --------------------------------------------------

        this.title =
            this.scene.add.text(
                this.x + 10,
                this.y + 10,
                'INVENTORY',
                {
                    fontSize: '20px',
                    color: '#ffffff'
                }
            );

        this.title.setDepth(
            this.depth + 1
        );


        // --------------------------------------------------
        // Content container
        // --------------------------------------------------

        this.content =
            this.scene.add.container();

        this.content.setDepth(
            this.depth + 1
        );
    }

    getCategoryColor(category) {
        const colors = {
            element: '#66ccff',
            molecule: '#66ff99',
            compound: '#ffcc66',
            biological: '#ff66cc',
            research: '#cc99ff'
        };
    
        return colors[category] ?? '#ffffff';
    }

    // --------------------------------------------------
    // Refresh
    // --------------------------------------------------

    refresh() {
    
        this.content.removeAll(true);
    
        this.items = [];
    
        let y = this.y + 45;
    
        const inventoryItems =
            this.getInventoryItems();
    
    
        // --------------------------------------------------
        // Group by category
        // --------------------------------------------------
    
        const categories = {};
    
        inventoryItems.forEach(item => {
    
            // Only show unlocked items
            if (!item.unlocked) return;
    
            const amount =
                this.stageProgress.get(item.id);
    
            const category =
                item.category ?? 'other';
    
            if (!categories[category]) {
                categories[category] = [];
            }
    
            categories[category].push({
                item,
                amount
            });
        });
    
    
        // --------------------------------------------------
        // Render categories
        // --------------------------------------------------
    
        Object.entries(categories)
            .forEach(([category, items]) => {
    
                // Category heading
                const categoryText =
                    this.scene.add.text(
                        this.x + 10,
                        y,
                        category.toUpperCase(),
                        {
                            fontSize: '14px',
                            color: '#fff'
                        }
                    );
    
                this.content.add(categoryText);
    
                y += 20;
    
    
                // Items
                items.forEach(({ item, amount }) => {
    
                    const text =
                        this.scene.add.text(
                            this.x + 20,
                            y,
                            `${item.title ?? item.id}: ${amount}`,
                            {
                                fontSize: '16px',
                                color:
                                    this.getCategoryColor(category)
                            }
                        );
    
                    this.content.add(text);
    
                    this.items.push({
                        id: item.id,
                        text
                    });
    
                    y += 22;
                });
    
    
                // Space between categories
                y += 8;
            });
    }

    // --------------------------------------------------
    // Get inventory items
    // --------------------------------------------------

    getInventoryItems() {

        const items = [];

        this.stageItems.forEach(item => {
            // Avoid duplicates
            if (
                items.some(
                    existing =>
                        existing.id === item.id
                )
            ) {
                return;
            }

            items.push(item);

        });

        return items;
    }


    // --------------------------------------------------
    // Destroy
    // --------------------------------------------------

    destroy() {

        if (
            this.stageProgress &&
            this._changedHandler
        ) {

            this.stageProgress.off(
                'changed',
                this._changedHandler
            );
        }


        this.content?.destroy();
        this.background?.destroy();
        this.title?.destroy();


        this.items = [];

        this.content = null;
        this.background = null;
        this.title = null;
    }
}