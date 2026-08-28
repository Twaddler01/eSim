import { listenToEvent } from '../../utils/stageHelpers.js';
import ScrollBox from '../../utils/ScrollBox.js';
import TrackerCard from './TrackerCard.js';

export default class StageDiscoveryTracker {

    constructor(scene, objectivesManager, options = {}) {

        this.scene = scene;
        this.objectivesManager = objectivesManager;

        this.scrollBox = null;
        this.objectives = [];

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.height = options.height ?? 200;

        this.depth =
            this.scene.depths?.tracker ?? 10;

        this.removeProgressListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                event => {
                    this.handleProgressUpdate(event);
                }
            );

        this.create();
        this.refresh();
    }

    create() {

        this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0);

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

    handleProgressUpdate(event) {
        const currentObjectives =
            this.objectivesManager
                .getTrackedObjectives({
                    newestFirst: true
            });

        const currentIds =
            currentObjectives.map(
                objective => objective.id
            );
    
        const displayedIds =
            this.objectives.map(
                card => card.objective.id
            );
    
        const sameObjectives =
            currentIds.length === displayedIds.length &&
            currentIds.every(
                (id, index) =>
                    id === displayedIds[index]
            );
    
        // Same cards -> only update their contents
        if (sameObjectives) {
            this.objectives.forEach(
                card => card.update()
            );
            return;
        }
    
        // Different cards, including 0 cards -> rebuild
        this.refresh();
    }
    
    refresh() {
        const objectives =
            this.objectivesManager
                .getTrackedObjectives({
                    newestFirst: true
                });
    
        this.clearObjectives();

        if (objectives.length === 0) {
            this.showEmptyState();
            return;
        }
    
        let y = 10;
    
        objectives.forEach(
            objective => {
    
                const card =
                    new TrackerCard(
                        this.scene,
                        {
                            x: this.x + 10,
                            y,
                            width: this.width - 20,
    
                            objective,
    
                            objectivesManager:
                                this.objectivesManager,
                            
                            unlocksItems: this.objectivesManager.objectiveUnlockList(objective),
                        }
                    );
    
                this.scrollBox.content.add(
                    card.container
                );
    
                this.objectives.push(card);
    
                y +=
                    card.height +
                    10;
            }
        );
    
        this.scrollBox.setContentHeight(
            y + 10
        );
    }
    
    clearObjectives() {
        this.objectives.forEach(
            card => card.destroy?.()
        );
    
        this.objectives = [];
    
        this.emptyText?.destroy();
        this.emptyText = null;
    
        this.scrollBox.scrollToTop();
    }
    
    showEmptyState() {
        this.emptyText =
            addText(
                this.scene,
                this.x + 10,
                this.y + 10,
                'No objectives are currently being tracked.\n\n' +
                'Visit DISCOVER tab to follow an objective.',
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    wordWrap: {
                        width: this.width - 20
                    },
                    align: 'center'
                }
            );
    
        this.scrollBox.content.add(
            this.emptyText
        );
    
        this.scrollBox.setContentHeight(
            this.emptyText.height + 20
        );
    }

    destroy() {
        this.removeProgressListener?.();
        this.objectives.forEach(
            card => card.destroy?.()
        );
    
        this.objectives = [];
    
        this.background?.destroy();
        this.scrollBox?.destroy();
        
        this.emptyText?.destroy();
    
        this.background = null;
        this.scrollBox = null;
    }
}