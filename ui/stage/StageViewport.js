import StageCard from './StageCard.js';

export default class StageViewport {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.x = options.x ?? 10;
        this.y = options.y ?? 60;

        this.width =
            options.width ??
            scene.scale.width - 20;

        this.height =
            options.height ?? 400;

        this.depth = this.scene.depths.viewport;

        // Cards
        this.cards = [];

        // Total height occupied by cards
        this.contentHeight = 0;

        // Scroll position
        this.scrollY = 0;
        this.maxScrollY = 0;

        this.create();
    }


    // --------------------------------------------------
    // Create viewport
    // --------------------------------------------------

    create() {

        // --------------------------------------------------
        // Viewport background
        // --------------------------------------------------

        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x111111
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);


        // --------------------------------------------------
        // Container for cards
        // --------------------------------------------------

        this.container =
            this.scene.add.container(
                this.x,
                this.y
            );


        // --------------------------------------------------
        // Mask
        // --------------------------------------------------

        const maskShape =
            this.scene.make.graphics({
                add: false
            });

        maskShape.fillStyle(0xffffff);

        maskShape.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        this.mask =
            maskShape.createGeometryMask();

        this.container.setMask(
            this.mask
        );


        // --------------------------------------------------
        // Scroll interaction area
        // --------------------------------------------------

        this.container.setDepth(this.depth);
        this.setupScrolling();
    }


    // --------------------------------------------------
    // Add card
    // --------------------------------------------------

    addCard(options = {}) {

        const padding = 15;

        const cardWidth =
            this.width -
            padding * 2;

        const x = padding;

        const y =
            this.contentHeight +
            padding;


        const card =
            new StageCard(
                this.scene,
                {
                    ...options,

                    x,
                    y,

                    width: cardWidth,

                    container: this.container
                }
            );

        this.cards.push(card);

        // Advance content position
        this.contentHeight =
            y +
            card.height;


        this.updateScrollLimits();


        return card;
    }


    // --------------------------------------------------
    // Update scroll limits
    // --------------------------------------------------

    updateScrollLimits() {

        this.maxScrollY =
            Math.max(
                0,
                this.contentHeight + 15 - // + 15 padding tweak added
                this.height
            );


        // Make sure current position is valid
        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY,
                0,
                this.maxScrollY
            );


        this.updateScrollPosition();
    }


    // --------------------------------------------------
    // Scroll
    // --------------------------------------------------

    scroll(amount) {

        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY + amount,
                0,
                this.maxScrollY
            );


        this.updateScrollPosition();
    }


    // --------------------------------------------------
    // Update container position
    // --------------------------------------------------

    updateScrollPosition() {

        this.container.y =
            this.y -
            this.scrollY;
    }


    // --------------------------------------------------
    // Scrolling input
    // --------------------------------------------------

    setupScrolling() {
    
        const input = this.scene.input;
    
        this._pointerDownHandler = (pointer, gameObjects) => {
    
            const inside =
                pointer.x >= this.x &&
                pointer.x <= this.x + this.width &&
                pointer.y >= this.y &&
                pointer.y <= this.y + this.height;
    
            if (!inside) return;
    
            // Let buttons/cards handle their own interaction
            if (gameObjects.length > 0) return;
    
            this.isDragging = true;
    
            this.dragStartY = pointer.y;
            this.scrollStartY = this.scrollY;
        };
    
    
        this._pointerMoveHandler = (pointer) => {
    
            if (!this.isDragging) return;
    
            const deltaY =
                pointer.y - this.dragStartY;
    
            this.scrollY =
                this.scrollStartY - deltaY;
    
            this.scrollY =
                Phaser.Math.Clamp(
                    this.scrollY,
                    0,
                    this.maxScrollY
                );
    
            this.updateScrollPosition();
        };
    
    
        this._pointerUpHandler = () => {
    
            this.isDragging = false;
        };
    
    
        this._wheelHandler = (
            pointer,
            gameObjects,
            deltaX,
            deltaY
        ) => {
    
            const inside =
                pointer.x >= this.x &&
                pointer.x <= this.x + this.width &&
                pointer.y >= this.y &&
                pointer.y <= this.y + this.height;
    
            if (!inside) return;
    
            this.scroll(deltaY);
        };
    
    
        input.on(
            'pointerdown',
            this._pointerDownHandler
        );
    
        input.on(
            'pointermove',
            this._pointerMoveHandler
        );
    
        input.on(
            'pointerup',
            this._pointerUpHandler
        );
    
        input.on(
            'wheel',
            this._wheelHandler
        );
    }

    clearCards() {
    
        this.cards.forEach(card => {
    
            card.destroy?.();
    
        });
    
        this.cards = [];
    
        this.contentHeight = 0;
        this.scrollY = 0;
    
        this.updateScrollLimits();
    }
    
    showCards(cardData = []) {
    
        this.clearCards();
    
        cardData.forEach(data => {
            this.addCard(data);
        });
    
        this.scrollY = 0;
    
        this.updateScrollPosition();
    }
    
    destroy() {
    
        const input = this.scene.input;
    
        input.off(
            'pointerdown',
            this._pointerDownHandler
        );
    
        input.off(
            'pointermove',
            this._pointerMoveHandler
        );
    
        input.off(
            'pointerup',
            this._pointerUpHandler
        );
    
        input.off(
            'wheel',
            this._wheelHandler
        );
    
    
        this.cards.forEach(card => {
            card.destroy?.();
        });
    
        this.cards = [];
    
    
        this.container.destroy();
    
        this.background.destroy();
    
        this.mask.destroy?.();
    }
}