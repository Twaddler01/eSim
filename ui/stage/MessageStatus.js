import ScrollBox from '../../utils/ScrollBox.js';

export default class MessageStatus {

    constructor(scene, gameTimer, gameData, options = {}) {

        this.scene = scene;
        this.gameTimer = gameTimer;
        this.messageData = gameData.messageData;
        
        this.x = options.x ?? 10;
        this.y = options.y ?? 10;
        this.width = options.width ?? 300;
        this.height = options.height ?? 100
        this.depth = options.depth ?? 0;
        this.fontSize = options.fontSize ?? '12px';
        this.fontColor = options.fontColor ?? '#fff';

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
        this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            0x000055
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);
    
        this.msgArea = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    
        this.scrollBox =
            new ScrollBox(
                this.scene,
                {
                    x: this.x,
                    y: this.y + 3,
                    width: this.width,
                    height: this.height - 6,
                    depth: this.depth,
                    maskPadding: 2
                }
            );
    
        this.messageContainer =
            this.scrollBox.content;
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
    
        const text = addText(this.scene,
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

        this.scrollBox.setScroll(
            newestMessageY - 10
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
    
        this.scrollBox.setContentHeight(y);
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
    
        this.messageData.push({
            timestamp, message
        });
    
        // Keep only the newest 10
        if (this.messageData.length > 10) {
            this.messageData.shift();
        }
    }

    loadMessages() {
        if (!this.messageData?.length) return;
    
        this.messageData.forEach(savedMessage => {
    
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