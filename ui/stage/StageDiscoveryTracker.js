import { listenToEvent } from '../../utils/stageHelpers.js';
import ScrollBox from '../../utils/ScrollBox.js';
import TrackerCard from './TrackerCard.js';

export default class StageDiscoveryTracker {

    constructor(scene, stageProgress, options = {}) {

        this.scene = scene;
        this.stageProgress = stageProgress;

        this.scrollBox = null;
        this.objectives = [];

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.height = options.height ?? 200;

        //this.depth =
            //this.scene.depths?.tracker ?? 10;

        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                () => {
                    this.refresh();
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

    refresh() {
    
        const objectives =
            this.stageProgress
                .getTrackedObjectives();
    
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
    
                            stageProgress:
                                this.stageProgress,
    
                            onUntrack:
                                () => {
                                    this.stageProgress
                                        .setObjectiveTracked(
                                            objective.id,
                                            false
                                        );
                                }
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
            10,
            10,
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
    
        this.background = null;
        this.scrollBox = null;
    }
}