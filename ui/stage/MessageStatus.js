import { messageData } from '../../data/gameData.js';

export default class MessageStatus {

    constructor(scene, gameTimer, options = {}) {
        // old -- width, gameTimer, y

        this.scene = scene;
        
        this.x = options.x ?? 10;
        this.y = options.y ?? 10;
        this.width = options.width ?? 300;
        this.height = options.height ?? 100
        this.depth = options.depth ?? 0;
        this.fontSize = options.fontSize ?? '12px';
        this.fontColor = options.fontColor ?? '#fff';
        this.gameTimer = gameTimer;

        this.messages = [];

        this.scrollY = 0;
        this.maxScrollY = 0;

        this.draw();
        this.loadMessages();
    }


    // --------------------------------------------------
    // Draw message window
    // --------------------------------------------------

    draw() {
        const width = this.width;
        const height = this.height;
        const x = this.x;
        const y = this.y;

        // --------------------------------------------------
        // Background
        // --------------------------------------------------

        this.scene.add.rectangle(
            x,
            y,
            width,
            height,
            0x000055
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);

        // --------------------------------------------------
        // Message viewport dimensions
        // --------------------------------------------------

        const winX = this.x + 1;
        const winY = this.y + 1;

        const winWidth = this.width - 1;
        const winHeight = this.height - 1;

        this.msgArea = {
            x: winX,
            y: winY,
            width: winWidth,
            height: winHeight
        };

        // --------------------------------------------------
        // Message container
        // --------------------------------------------------

        this.messageContainer =
            this.scene.add.container(0, 0);
        this.messageContainer.setDepth(this.depth);


        // --------------------------------------------------
        // Mask
        // --------------------------------------------------

        const maskShape =
            this.scene.make.graphics({ add: false });

        maskShape.fillStyle(0xffffff);

        maskShape.fillRect(
            winX,
            winY + 1,
            winWidth,
            winHeight - 3
        );

        this.messageMask =
            maskShape.createGeometryMask();

        this.messageContainer.setMask(
            this.messageMask
        );


        // --------------------------------------------------
        // Scrolling
        // --------------------------------------------------

        this.scrollZone = this.scene.add.zone(
            winX,
            winY,
            winWidth,
            winHeight
        )
            .setOrigin(0)
            .setInteractive();


        // --------------------------------------------------
        // Desktop mouse wheel
        // --------------------------------------------------

        this.scrollZone.on(
            'wheel',
            (pointer, over, dx, dy) => {

                this.scrollY -= dy;

                this.scrollY = Phaser.Math.Clamp(
                    this.scrollY,
                    0,
                    this.maxScrollY
                );

                this.updateMessagePosition();
            }
        );


        // --------------------------------------------------
        // Mobile touch scrolling
        // --------------------------------------------------

        this.isDragging = false;

        this.dragStartY = 0;
        this.scrollStartY = 0;


        this.scrollZone.on(
            'pointerdown',
            pointer => {

                this.isDragging = true;

                this.dragStartY = pointer.y;

                this.scrollStartY =
                    this.scrollY;
            }
        );


        this.scrollZone.on(
            'pointermove',
            pointer => {

                if (!this.isDragging) return;

                const deltaY =
                    pointer.y - this.dragStartY;

                this.scrollY =
                    this.scrollStartY - deltaY;

                this.scrollY = Phaser.Math.Clamp(
                    this.scrollY,
                    0,
                    this.maxScrollY
                );

                this.updateMessagePosition();
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


    // --------------------------------------------------
    // Add message
    // --------------------------------------------------

    addMessage(message, timestamp = null, save = true) {
        if (!message) return;

        // Store for saving
        // Loaded messages should not be saved again.
        if (save) {
            this.storeMessage(message);
        }

        // Use existing timestamp when loading,
        // otherwise generate a new one.
        const displayTimestamp = timestamp || this.getTimestamp();

        // --------------------------------------------------
        // Create message text
        // --------------------------------------------------
    
        const displayMessage = `${displayTimestamp}: "${message}"`;
        
        const padding = 24;
    
        const text = this.scene.add.text(
            padding,
            0,
            displayMessage,
            {
                fontSize: this.fontSize,
                color: this.fontColor,
    
                wordWrap: {
                    width: this.msgArea.width - padding * 2
                },
    
                lineSpacing: 4
            }
        )
        .setOrigin(0);

        // --------------------------------------------------
        // Add to message container
        // --------------------------------------------------

        this.messageContainer.add(text);


        // Store message
        this.messages.push(text);


        // --------------------------------------------------
        // Reposition all messages
        // --------------------------------------------------

        this.layoutMessages();


        // --------------------------------------------------
        // IMPORTANT:
        //
        // Put the NEW message at the top of the
        // viewport rather than scrolling to the
        // bottom of the entire message history.
        // --------------------------------------------------

        const newestMessage =
            this.messages[
                this.messages.length - 1
            ];


        const newestMessageY =
            newestMessage.y;


        this.scrollY =
            newestMessageY - 10;


        this.scrollY = Phaser.Math.Clamp(
            this.scrollY,
            0,
            this.maxScrollY
        );


        this.updateMessagePosition();
    }
    
    // --------------------------------------------------
    // Add message after delay
    // --------------------------------------------------
    
    addMessageDelayed(message, delay = 1000) {
        this.scene.time.delayedCall(
            delay,
            () => {
                this.addMessage(message);
            }
        );
    }

    // --------------------------------------------------
    // Layout messages
    // --------------------------------------------------

    layoutMessages() {

        const padding = 8;
        const spacing = 12;

        let y = padding;


        this.messages.forEach(message => {

            message.y = y;

            y += message.height + spacing;
        });


        // --------------------------------------------------
        // Total content height
        // --------------------------------------------------

        const contentHeight =
            y;


        this.maxScrollY = Math.max(
            0,

            contentHeight -
            this.msgArea.height
        );
    }


    // --------------------------------------------------
    // Update message position
    // --------------------------------------------------

    updateMessagePosition() {

        this.messageContainer.y =
            this.msgArea.y -
            this.scrollY;
    }

    getTimestamp() {
        return this.gameTimer.getTimestamp();
    }
    
    storeMessage(message) {
        if (!message) return;
    
        const timestamp = this.getTimestamp();
    
        messageData.push({
            timestamp, message
        });
    
        // Keep only the newest 10
        if (messageData.length > 10) {
            messageData.shift();
        }
    }

    loadMessages() {
        if (!messageData?.length) return;
    
        messageData.forEach(savedMessage => {
    
            this.addMessage(
                savedMessage.message,
                savedMessage.timestamp,
                false
            );
    
        });
    }

    testMessages() {
        this.addMessage(
            'You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease.'
        );

        this.addMessage(
            'This is another message that may be long enough to wrap across several lines. This is another message that may be long enough to wrap across several lines.'
        );
        
        this.addMessage(
            'Text is text is Text is text Text is text is Text is text Text is text is Text is text is Text it is text is.'
        );
    }
}