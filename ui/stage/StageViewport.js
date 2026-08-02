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

        this.scrollZone =
            this.scene.add.zone(
                this.x,
                this.y,
                this.width,
                this.height
            )
            .setOrigin(0)
            .setInteractive();


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

        const cardHeight =
            options.height ?? 150;


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
                    height: cardHeight,

                    container: this.container
                }
            );


        this.cards.push(card);


        // Advance content position
        this.contentHeight =
            y +
            cardHeight;


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
                this.contentHeight -
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

        // --------------------------------------------------
        // Mouse wheel
        // --------------------------------------------------

        this.scrollZone.on(
            'wheel',
            (pointer, over, dx, dy) => {

                this.scroll(dy);
            }
        );


        // --------------------------------------------------
        // Touch
        // --------------------------------------------------

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
}