import { stageData, stageItems, stageObjectives } from '../data/stageData.js';

export default class DebugButtons {

    constructor(scene, stageProgress) {
        this.scene = scene;
        this.saveManager = this.scene.registry.get('saveManager');
        
        this.stageProgress = stageProgress;

        this.container = this.scene.add.container();
        // Place on top of everything
        this.container.setDepth(1000);

        this.x = 50;
        this.y = 50;

        this.buttonWidth = 180;
        this.buttonHeight = 40;
        this.spacing = 10;

        this.create();
    }

    create() {
        this.addTitle('DEBUG BUTTONS:');

/* BUTTONS
this.addButton('Clear Save Data', () => {
    this.saveManager.clear();
});
////
this.addButton('unlock the_void (gather)', () => {
    this.stageProgress.unlock('the_void');
});*/
////
this.addSelectButton(
    'UNLOCK',
    this.getUnlockIds(),
    id => {
        jp(id);
        this.stageProgress.unlock(id);
    }
);
////
this.addButton('SHOW UNLOCKED', () => {
    const unlocked = this.stageProgress.getAllUnlocked();
    jp(unlocked);
});
////
this.addButton('Show current savedData', () => {
    this.saveManager.debug();
});
////
this.addButton('getCreateData(item)', () => {
    stageItems.filter(i => i.tab === 'create').forEach(item => {
        console.log(this.stageProgress.getCreateData(item));
    });
});
////
this.addButton('getObjectiveData', () => {
    jp(this.stageProgress.getObjectiveData());
});
////
this.addButton('gameTimer', () => {
    const time = this.scene.gameTimer.getRaw();
    jp(time);
});
////

////

    }

    addTitle(label) {
        const bg = this.scene.add.rectangle(
            0, 0,
            this.buttonWidth,
            this.buttonHeight,
            0x333333
        )
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
    
    
        const text = this.scene.add.text(
            10,
            this.buttonHeight / 2,
            label,
            {
                fontSize: '20px',
                color: '#fff',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0, 0.5);
    
    
        const container = this.scene.add.container(
            this.x,
            this.y
        );
    
        container.add([bg, text]);
    
        this.container.add(container);
    
        // =========================
        // DRAG DEBUG PANEL
        // =========================
    
        bg.on('pointerdown', (pointer) => {
    
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
    
            this.panelStartX = this.container.x;
            this.panelStartY = this.container.y;
    
            this.dragging = true;
        });
    
    
        this.scene.input.on('pointermove', (pointer) => {
    
            if (!this.dragging) return;
    
            const dx = pointer.x - this.dragStartX;
            const dy = pointer.y - this.dragStartY;
    
            this.container.x = this.panelStartX + dx;
            this.container.y = this.panelStartY + dy;
        });
    
    
        this.scene.input.on('pointerup', () => {
            this.dragging = false;
        });
    
    
        this.y += this.buttonHeight + this.spacing;
    }

    addButton(label, onClick) {

        const bg = this.scene.add.rectangle(
            0, 0,
            this.buttonWidth,
            this.buttonHeight,
            0x333333
        )
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });

        bg.on('pointerdown', () => {
            onClick?.();
        });


        const border = this.scene.add.graphics();

        border.lineStyle(2, 0xffffff);
        border.strokeRect(
            0,
            0,
            this.buttonWidth,
            this.buttonHeight
        );


        const text = this.scene.add.text(
            10,
            this.buttonHeight / 2,
            label,
            {
                fontSize: '20px',
                color: '#fff'
            }
        )
        .setOrigin(0, 0.5);


        const container = this.scene.add.container(
            this.x,
            this.y
        );

        container.add([
            bg,
            border,
            text
        ]);

        this.container.add(container);

        this.y += this.buttonHeight + this.spacing;
    }

    // DEBUG BUTTON HELPERS
    getUnlockIds() {
        let allCardIds = 
            this.stageProgress.getAllCardIds();
        
        allCardIds = allCardIds.map(item => ({
                id: item.id,
                title: item.title
            }));
        
        return allCardIds;
    }

    addSelectButton(label, options, onSelect) {
        const button = this.addButton(label, () => {
            this.showSelect(
                options,
                onSelect
            );
        });
    
        return button;
    }

    showSelect(options, onSelect) {
        // Don't create another selector
        if (this.activeSelect) {
            this.closeSelect();
            return;
        }
    
        const container = this.scene.add.container(
            20,
            300
        );
    
        this.activeSelect = container;
        this.activeSelect.setDepth(99999);
        this.scene.children.bringToTop(this.activeSelect);

        options.forEach((option, index) => {
    
            const y = index * 45;
    
            const background =
                this.scene.add.rectangle(
                    0,
                    y,
                    300,
                    40,
                    0x222222
                )
                .setOrigin(0)
                .setInteractive();
    
            const text =
                this.scene.add.text(
                    10,
                    y + 10,
                    option.title,
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                );
    
            background.on('pointerdown', () => {
    
                onSelect(option.id);
    
                this.closeSelect();
            });
    
            container.add([
                background,
                text
            ]);
        });
    }

    closeSelect() {
        this.activeSelect?.destroy();
        this.activeSelect = null;
    }

}