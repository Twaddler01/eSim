export default class ScrollBox {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;

        this.width =
            options.width ?? 300;

        this.height =
            options.height ?? 200;

        this.depth =
            options.depth ?? 0;

        this.maskPadding =
            options.maskPadding ?? 2;

        this.scrollY = 0;
        this.maxScrollY = 0;

        this.create();
    }

    create() {

        // ---------------------------------------------
        // Content container
        // ---------------------------------------------

        this.content =
            this.scene.add.container();

        this.content.setDepth(
            this.depth + 1
        );

        // ---------------------------------------------
        // Mask
        // ---------------------------------------------

        const maskShape =
            this.scene.make.graphics({
                add: false
            });

        maskShape.fillStyle(0xffffff);

        maskShape.fillRect(
            this.x,
            this.y + this.maskPadding,
            this.width,
            this.height -
                this.maskPadding * 2
        );

        this.mask =
            maskShape.createGeometryMask();

        this.content.setMask(
            this.mask
        );

        // ---------------------------------------------
        // Scroll zone
        // ---------------------------------------------

        this.scrollZone =
            this.scene.add.zone(
                this.x,
                this.y,
                this.width,
                this.height
            )
            .setOrigin(0)
            .setInteractive();

        // ---------------------------------------------
        // Mouse wheel
        // ---------------------------------------------

        this.scrollZone.on(
            'wheel',
            (pointer, over, dx, dy) => {

                this.scrollBy(-dy);
            }
        );

        // ---------------------------------------------
        // Touch scrolling
        // ---------------------------------------------

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

                if (!this.isDragging) {
                    return;
                }

                const deltaY =
                    pointer.y -
                    this.dragStartY;

                this.setScroll(
                    this.scrollStartY -
                    deltaY
                );
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

    // ---------------------------------------------
    // Set scroll position
    // ---------------------------------------------

    setScroll(value) {

        this.scrollY =
            Phaser.Math.Clamp(
                value,
                0,
                this.maxScrollY
            );

        this.updatePosition();
    }

    // ---------------------------------------------
    // Move scroll position
    // ---------------------------------------------

    scrollBy(amount) {
        this.setScroll(
            this.scrollY + amount
        );
    }

    // ---------------------------------------------
    // Set content height
    // ---------------------------------------------

    setContentHeight(height) {

        this.contentHeight =
            height;

        this.maxScrollY =
            Math.max(
                0,
                height - this.height
            );

        // Make sure current position
        // is still valid.
        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY,
                0,
                this.maxScrollY
            );

        this.updatePosition();
    }

    // ---------------------------------------------
    // Update content position
    // ---------------------------------------------

    updatePosition() {

        this.content.y =
            this.y -
            this.scrollY;
    }

    // ---------------------------------------------
    // Reset to top
    // ---------------------------------------------

    scrollToTop() {
        this.setScroll(0);
    }

    // ---------------------------------------------
    // Reset to bottom
    // ---------------------------------------------

    scrollToBottom() {
        this.setScroll(
            this.maxScrollY
        );
    }

    // ---------------------------------------------
    // Destroy
    // ---------------------------------------------

    destroy() {

        this.scrollZone?.destroy();
        this.content?.destroy();

        this.mask?.destroy();

        this.content = null;
        this.scrollZone = null;
        this.mask = null;
    }
}