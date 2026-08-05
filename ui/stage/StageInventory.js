import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';

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

        this.scrollY = 0;
        this.maxScrollY = 0;

        this.create();

        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                () => {
                    this.refresh();
                }
            );

        // Initial display
        this.refresh();
    }

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

        // Title
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

        // Content viewport
        this.contentX =
            this.x + 1;

        this.contentY =
            this.y + 40;

        this.contentWidth =
            this.width - 2;

        this.contentHeight =
            this.height - 41;

        // Content container
        this.content =
            this.scene.add.container();

        this.content.setDepth(
            this.depth + 1
        );

        // Mask
        const maskShape =
            this.scene.make.graphics({
                add: false
            });
        maskShape.fillStyle(0xffffff);

        maskShape.fillRect(
            this.contentX,
            this.contentY,
            this.contentWidth,
            this.contentHeight
        );

        this.mask =
            maskShape.createGeometryMask();

        this.content.setMask(
            this.mask
        );

        // Scroll zone
        this.scrollZone =
            this.scene.add.zone(
                this.contentX,
                this.contentY,
                this.contentWidth,
                this.contentHeight
            )
            .setOrigin(0)
            .setInteractive();

        // Mouse wheel
        this.scrollZone.on(
            'wheel',
            (pointer, over, dx, dy) => {

                this.scrollY -= dy;

                this.scrollY =
                    Phaser.Math.Clamp(
                        this.scrollY,
                        0,
                        this.maxScrollY
                    );

                this.updateScrollPosition();
            }
        );

        // Mobile touch scrolling
        this.isDragging = false;
        this.dragStartY = 0;
        this.scrollStartY = 0;

        this.scrollZone.on(
            'pointerdown',
            pointer => {

                this.isDragging = true;

                this.dragStartY =
                    pointer.y;

                this.scrollStartY =
                    this.scrollY;
            }
        );

        this.scrollZone.on(
            'pointermove',
            pointer => {

                if (!this.isDragging) return;

                const deltaY =
                    pointer.y -
                    this.dragStartY;

                this.scrollY =
                    this.scrollStartY -
                    deltaY;

                this.scrollY =
                    Phaser.Math.Clamp(
                        this.scrollY,
                        0,
                        this.maxScrollY
                    );

                this.updateScrollPosition();
            }
        );

        this.scrollZone.on(
            'pointerup',
            () => {
                this.isDragging = false;
            }
        );

        this.scrollZone.on(
            'pointerout',
            () => {
                this.isDragging = false;
            }
        );
    }

    // Category colors
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

    // Refresh
    refresh() {
        this.content.removeAll(true);
        this.items = [];
        let y = 8;
        const inventoryItems =
            this.getInventoryItems();

        // Group by category
        const categories = {};

        inventoryItems.forEach(item => {
            // Only show unlocked
            if (!item.unlocked) return;

            const amount =
                this.stageProgress.get(
                    item.id
                );

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

        // Render categories
        Object.entries(categories)
            .forEach(([category, items]) => {
                
                // Category heading
                const categoryText =
                    this.scene.add.text(
                        this.contentX + 10,
                        y,
                        category.toUpperCase(),
                        {
                            fontSize: '14px',
                            color: '#ffffff'
                        }
                    );

                this.content.add(
                    categoryText
                );

                y += 20;

                // Items
                items.forEach(
                    ({ item, amount }) => {
                        const max = getItemMax(item, this.stageProgress);
                        const itemMax = max > 0 ? ' / ' + max : '';

                        const text =
                            this.scene.add.text(
                                this.contentX + 20,
                                y,
                                
                                `${item.title ?? item.id}: ${Math.floor(amount)}${itemMax}`,
                                {
                                    fontSize: '16px',
                                    color:
                                        this.getCategoryColor(
                                            category
                                        )
                                }
                            );


                        this.content.add(text);


                        this.items.push({
                            id: item.id,
                            text
                        });
                        
                        y += 22;

                    }
                );

                // Space between categories
                y += 8;
            });

        // Calculate scroll range
        const contentHeight = y;

        this.maxScrollY =
            Math.max(
                0,
                contentHeight -
                this.contentHeight
            );

        // Keep current position valid
        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY,
                0,
                this.maxScrollY
            );
        this.updateScrollPosition();
        
    }

    // Update scroll position
    updateScrollPosition() {
        this.content.y =
            this.contentY -
            this.scrollY;
    }

    // Get inventory items
    getInventoryItems() {
        const items = [];

        this.stageItems.forEach(item => {
            // Avoid duplicates
            if (items.some(existing => existing.id === item.id)) {
                return;
            }

            items.push(item);
        });

        return items;
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();

        if (this.scene && this._tabChangedHandler) {
            this.scene.events.off(
                'stage-tab-changed',
                this._tabChangedHandler
            );
        }

        this.scrollZone?.destroy();
        this.content?.destroy();
        this.background?.destroy();
        this.title?.destroy();

        this.items = [];

        this.content = null;
        this.background = null;
        this.title = null;
    }
}