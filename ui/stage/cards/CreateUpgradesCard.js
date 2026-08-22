export default class CreateUpgradesCard {

    constructor(scene, options = {}) {

        this.scene = scene;
        
        this.amount = options.amount ?? 0;
        this.availability = options.availability ?? 'locked';
        
        this.create();
        this.update();
    }

    create() {
        
    }
    
    update(data = {}) {
        if ('amount' in data) {
            this.amount = data.amount;
        }

        if ('availability' in data) {
            this.availability = data.availability;
        }
    }
}