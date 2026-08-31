import { listenToEvent } from '../utils/stageHelpers.js';

export default class ObjectiveFlow {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.objectivesManager =
            options.objectivesManager ?? null;

        this.flowData =
            options.flowData ?? {};

        this.conversationData =
            options.conversationData ?? {};

        this.announcementManager =
            options.announcementManager ?? null;

        this.conversationManager =
            options.conversationManager ?? null;

        this.unlockTimer = null;
        this.flowTimer = null;

        // Delay between objective completion
        // and next unlock
        this.unlockDelay = 2000;

        // Observable flow changes
        this.events =
            new Phaser.Events.EventEmitter();
    }

    announceObjective(id, type) {
        const flow = this.flowData['announceObjective'];
        const data = flow.steps.find(s => s.id === type);
        const unlocksNew = this.objectivesManager.hasNewObjective(id);

        if (type === 'unlock' && !unlocksNew) {
            return;
        }
        
        this.announcementManager?.show(
            data.data
        );
    }

    getFlow(objectiveId) {
        return this.flowData[objectiveId] ?? false;
    }

    processSteps(steps) {
        this.steps = steps;
        this.stepIndex = 0;
    
        this.processNextStep();
    }
    
    processNextStep() {
        if (
            !this.steps ||
            this.stepIndex >= this.steps.length
        ) {
            return;
        }
    
        const step =
            this.steps[this.stepIndex];
    
        this.flowTimer =
            this.scene.time.delayedCall(
                step.delay ?? 0,
                () => {
    
                    switch (step.type) {
                        case 'announcement':
                            this.announcementManager
                                ?.show(
                                    step.data
                                );
                            break;
    
                        case 'conversation':
                            this.conversationManager
                                ?.start(
                                    step.data.id
                                );
                            break;
                    }
    
                    this.stepIndex++;
                    this.flowTimer = null;
    
                    this.processNextStep();
                }
            );
    }

    startFlow(objectiveId) {
        const flow =
            this.getFlow(objectiveId);
    
        if (!flow) {
            return;
        }
    
        this.processSteps(flow.steps);
    }

    // TrackerCard calls
    completeObjective(id) {
        const completed =
            this.objectivesManager
                .completeObjective(id);

        if (!completed) {
            return false;
        }

        // objective and flow id match
        const flow = this.getFlow(id);
        
        if (flow) {
            this.startFlow(id);
        } else {
            this.announceObjective(id, 'complete');
        }

        this.unlockTimer =
            this.scene.time.delayedCall(
                this.unlockDelay,
                () => {

                    this.objectivesManager
                        .processObjectiveUnlocks(id);
                    
                    if (!flow) {
                        this.announceObjective(id, 'unlock');
                    }
                    
                    this.events.emit(
                        'updated',
                        {
                            type: 'flow-complete',
                            id
                        }
                    );

                    this.unlockTimer = null;
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
        this.removeObjectiveListener?.();
    
        this.unlockTimer?.remove();
        this.unlockTimer = null;
    
        this.flowTimer?.remove();
        this.flowTimer = null;
    
        this.events.removeAllListeners();
        this.events.destroy();
    }
}