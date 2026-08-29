export default class ObjectiveFlow {

    constructor(scene, objectivesManager) {

        this.scene = scene;
        this.objectivesManager =
            objectivesManager;

        this.timer = null;

        // Observable flow changes
        this.events =
            new Phaser.Events.EventEmitter();
    }

    completeObjective(id) {

        const completed =
            this.objectivesManager
                .completeObjective(id);

        if (!completed) {
            return false;
        }

        this.timer =
            this.scene.time.delayedCall(
                1500,
                () => {

                    this.objectivesManager
                        .processObjectiveUnlocks(id);

                    this.events.emit(
                        'updated',
                        {
                            type: 'flow-complete',
                            id
                        }
                    );

                    this.timer = null;
                }
            );

        return true;
    }

    on(event, handler) {
        this.events.on(event, handler);
    }
    
    off(event, handler) {
        this.events.off(event, handler);
    }

    destroy() {

        this.timer?.remove();
        this.timer = null;

        this.events.removeAllListeners();
        this.events.destroy();
    }
}