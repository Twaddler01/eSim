/* CARD SOURCE
    let cards =
        stageItems.filter(
            item =>
                item.tab === this.currentTab
        );
*/
export default class StageCard {

    constructor(scene, options = {}) {
        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 930;
        this.height = options.height ?? 200;
        this.container = options.container;
        this.depth = this.scene.depths?.cards ?? 0;

        // Data
        this.id = options.id ?? null;
        this.tab = options.tab ?? 'gather';
        this.title = options.title ?? 'Item';
        this.description = options.description ?? '';

        // ALL elements (tab container)
        this.elements = [];
        
        // Source for ALL cards
        this.ui = {};
        // Specialized UI cards by type
        this.gatherUI = {};
        this.createUI = {};
        this.discoverUI = {};

        this.create();
        this.update(options);
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // CREATE
    create() {
        // ui
        this.createBackground();
        this.createStatusOverlay();
        this.createTitle();

        switch (this.tab) {
            case 'gather':
                this.createGather();
                break;
            case 'create':
                this.createCreate();
                break;
            case 'discover':
                this.createDiscover();
                break;
        }
    }

    createBackground() {

        this.ui.background =
            this.addElement(
                this.scene.add.rectangle(
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                    0x000055
                )
                .setOrigin(0)
                .setStrokeStyle(1, 0x000000)
            );
    }

    createStatusOverlay() {
        // Locked overlay
        this.ui.lockOverlay =
            this.addElement(
                this.scene.add.rectangle(
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                    0x000000,
                    0.55
                )
                .setOrigin(0)
            );
                
        // Availability message
        this.ui.availabilityText =
                this.addElement(
                    addText(this.scene,
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        'LOCKED',
                        {
                            fontSize: '18px',
                            color: '#ffffff'
                        }
                    )
                .setOrigin(0.5)
            );
    }

    createTitle() {
        this.ui.title =
            this.addElement(
                addText(
                    this.scene,
                    this.x + 15,
                    this.y + 12,
                    this.title,
                    {
                        fontSize: '22px',
                        color: '#ffffff'
                    }
                )
            );
    }

    createGather() {

        //console.log('Creating gather card');

        // amount
        // upgrades
        // gather button
    }

    createCreate() {

        //console.log('Creating create card');

        // requirements
        // produces
        // create button
    }

    createDiscover() {

        //console.log('Creating discover card');

        // objective / discovery information
    }

    // UPDATE
    update(data = {}) {

        switch (this.tab) {

            case 'gather':
                this.updateGather(data);
                break;

            case 'create':
                this.updateCreate(data);
                break;

            case 'discover':
                this.updateDiscover(data);
                break;
        }
    }

    updateGather(data) {

        //console.log('Updating gather card');
    }

    updateCreate(data) {

        //console.log('Updating create card');
    }

    updateDiscover(data) {

        //console.log('Updating discover card');
    }

    // POSITION
    setY(y) {

        const delta =
            y - this.y;

        if (delta === 0) {
            return;
        }

        this.y = y;

        this.elements.forEach(
            element => {
                element.y += delta;
            }
        );
    }

    // DESTROY
    destroy() {
        this.elements.forEach(
            element => element.destroy()
        );

        // Reset ui
        this.elements = [];
        this.ui = [];
        this.gatherUI = [];
        this.createUI = [];
        this.discoverUI = [];
    }
}