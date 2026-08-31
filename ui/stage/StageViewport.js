import StageCard from './StageCard.js';
import ScrollBox from '../../utils/ScrollBox.js';

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

        this.objectivesManager = options.objectivesManager ?? null;

        // id -> StageCard
        this.cards = new Map();

        this.contentHeight = 0;

        this.scrollBox = null;

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

        this.scrollBox =
            new ScrollBox(
                this.scene,
                {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height,
                    depth: this.depth
                }
            );
    }

    setBounds(y, height) {
        this.y = y;
        this.height = height;
    
        this.background.y = y;
    
        this.scrollBox.setBounds(
            y,
            height
        );
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
    
                    parentContainer: this.scrollBox.content,
                    
                    objectivesManager: this.objectivesManager
                }
            );
    
        this.cards.set(options.id, card);
    
        this.contentHeight =
            y + card.height;
    
        this.scrollBox.setContentHeight(
            this.contentHeight + padding
        );
    
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
    
        this.scrollBox.setContentHeight(
            this.contentHeight
        );
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

    // Clear cards
    clearCards() {
        this.cards.forEach(card => {
            card.destroy?.();
        });

        // Keep this a Map.
        this.cards.clear();

        this.contentHeight = 0;
        
        this.scrollBox.setContentHeight(0);
        this.scrollBox.scrollToTop();
    }

    // Build cards for a new tab
    showCards(cardData = []) {
        this.clearCards();
    
        cardData.forEach(data => {
            this.addCard(data);
        });
    
        this.scrollBox.scrollToTop();
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