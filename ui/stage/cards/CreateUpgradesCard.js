export default class CreateUpgradesCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 200;
        this.height = options.height ?? 50;
        
        this.container = options.container ?? null;

        this.amount = options.amount ?? 0;
        this.availability = options.availability ?? 'locked';

        this.elements = [];
        this.ui = {};

        this.create();
        this.update();
    }

    create() {
        // Title and overlay integrated already
        
        this.ui.cardReference =
            this.addElement(
                this.scene.add.rectangle(
                    10,
                    10,
                    this.width - 20,
                    this.height - 20,
                    0xff0000
                )
                .setOrigin(0)
                .setVisible(false)
            );
        
        //
        
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    update(data = {}) {
        // Amount of item this upgrade modifies
        if ('amount' in data) {
            this.amount = data.amount;
        }

        // 'active' or 'locked'
        if ('availability' in data) {
            this.availability = data.availability;
        }
    }

    // DESTROY
    destroy() {
        this.elements.forEach(
            element => element.destroy()
        );
        this.elements = [];
        this.container?.destroy();
        this.ui = {};
    }
}