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
        
        this.depth =
            this.scene.depths.viewport;

        // id -> StageCard
        this.cards = new Map();

        this.contentHeight = 0;

        this.scrollY = 0;
        this.maxScrollY = 0;

        this.create();
    }

    // Create
    create() {
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

        this.container =
            this.scene.add.container(
                this.x,
                this.y
            );

this.maskShape =
    this.scene.make.graphics({
        add: false
    });

this.maskShape.fillStyle(0xffffff);

this.maskShape.fillRect(
    0,
    0,
    this.width,
    this.height
);

this.mask =
    this.maskShape.createGeometryMask();

this.maskShape.setPosition(
    this.x,
    this.y
);

this.container.setMask(this.mask);
//// Mask old
/*
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
*/
////




        this.container.setDepth(this.depth);
        this.setupScrolling();
    }

    setBounds(y, height) {
    
        this.y = y;
        this.height = height;
    
        this.background.y = y;
    
        this.maskShape.setPosition(
            this.x,
            y
        );
    
        this.container.y =
            y - this.scrollY;
    
        this.maskShape.clear();
        this.maskShape.fillStyle(0xffffff);
        this.maskShape.fillRect(
            0,
            0,
            this.width,
            height
        );
    
        this.updateScrollLimits();
    }

    // Add card
    addCard(options = {}) {
    
        const padding = 15;
    
        const cardWidth =
            this.width - padding * 2;
    
        const x = padding;
    
        const y =
            this.contentHeight + padding;
    
        const card =
            new StageCard(
                this.scene,
                {
                    ...options,
    
                    x,
                    y,
    
                    width: cardWidth,
    
                    parentContainer: this.container
                }
            );
    
        this.cards.set(options.id, card);
    
        this.contentHeight =
            y + card.height;
    
        this.updateScrollLimits();
    
        return card;
    }

    syncCards(cardData = []) {
        const desiredIds =
            new Set(
                cardData.map(data => data.id)
            );
    
        // -----------------------------------------
        // 1. Remove cards no longer needed
        // -----------------------------------------
    
        this.cards.forEach((card, id) => {
    
            if (!desiredIds.has(id)) {
                card.destroy?.();
                this.cards.delete(id);
            }
        });
    
        // -----------------------------------------
        // 2. Add / update cards
        // -----------------------------------------
    
        cardData.forEach(data => {
    
            const existing =
                this.cards.get(data.id);
    
            if (existing) {
    
                this.updateCardData(
                    existing,
                    data
                );
    
            } else {
    
                this.addCard(data);
            }
        });
    
        // -----------------------------------------
        // 3. Rebuild display order
        // -----------------------------------------
    
        const orderedCards =
            new Map();
    
        cardData.forEach(data => {
    
            const card =
                this.cards.get(data.id);
    
            if (card) {
                orderedCards.set(
                    data.id,
                    card
                );
            }
        });
    
        this.cards = orderedCards;
    
        // -----------------------------------------
        // 4. Reposition
        // -----------------------------------------
    
        this.relayoutCards();
    }

    // syncCards helper
    updateCardData(card, data) {
        card.update(data);
    }

    updateCard(id, data) {
    
        const card =
            this.cards.get(id);
    
        if (!card) {
            return;
        }
    
        this.updateCardData(
            card,
            data
        );
    }

    relayoutCards() {
    
        const padding = 15;
        let currentY = padding;
    
        this.cards.forEach(card => {
    
            card.setY(currentY);
    
            currentY +=
                card.height +
                padding;
        });
    
        this.contentHeight = currentY;
    
        this.updateScrollLimits();
    }

    // Update multiple existing cards
    updateCards(updates) {
        updates.forEach(data => {
            this.updateCard(
                data.id,
                data
            );
        });
    }

    // Update scroll limits
    updateScrollLimits() {
        this.maxScrollY =
            Math.max(
                0,
                this.contentHeight + 15 -
                this.height
            );

        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY,
                0,
                this.maxScrollY
            );


        this.updateScrollPosition();
    }

    // Scroll
    scroll(amount) {
        this.scrollY =
            Phaser.Math.Clamp(
                this.scrollY + amount,
                0,
                this.maxScrollY
            );

        this.updateScrollPosition();
    }

    updateScrollPosition() {
        this.container.y =
            this.y -
            this.scrollY;
    }

    // Scrolling input
    setupScrolling() {

        const input = this.scene.input;

        this._pointerDownHandler =
            (pointer, gameObjects) => {

                const inside =
                    pointer.x >= this.x &&
                    pointer.x <= this.x + this.width &&
                    pointer.y >= this.y &&
                    pointer.y <= this.y + this.height;

                if (!inside) return;

                if (gameObjects.length > 0) return;

                this.isDragging = true;

                this.dragStartY =
                    pointer.y;

                this.scrollStartY =
                    this.scrollY;
            };

        this._pointerMoveHandler =
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
            };

        this._pointerUpHandler =
            () => {
                this.isDragging = false;
            };

        this._wheelHandler =
            (
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

    // Clear cards
    clearCards() {
        this.cards.forEach(card => {
            card.destroy?.();
        });

        // Keep this a Map.
        this.cards.clear();

        this.contentHeight = 0;
        this.scrollY = 0;

        this.updateScrollLimits();
    }

    // Build cards for a new tab
    showCards(cardData = []) {
        this.clearCards();

        cardData.forEach(data => {
            this.addCard(data);
        });

        this.scrollY = 0;

        this.updateScrollPosition();
    }

    // Destroy
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

        this.cards.clear();
        this.container.destroy();
        this.background.destroy();
        this.mask.destroy?.();
    }
}