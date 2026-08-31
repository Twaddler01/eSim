export default class AnnouncementManager {

    constructor(scene, options = {}) {
        this.scene = scene;
        this.objectivesManager = options.objectivesManager ?? null;

        this.active = false;
        this.queue = [];
        this.currentText = null;
    }

    show(announcement = null) {

        if (!announcement) {
            return;
        }
            
        this.queue.push(announcement);

        if (!this.active) {
            this.showNext();
        }
    }

    showNext() {
        if (this.queue.length === 0) {
            this.active = false;
            return;
        }

        this.active = true;

        const announcement =
            this.queue.shift();

        this.currentText =
            this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2,
                announcement.text,
                {
                    fontFamily: 'Arial',
                    fontSize: '64px',
                    color: '#ffffff',
                    fontStyle: 'bold',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 8
                }
            )
            .setOrigin(0.5)
            .setDepth(1000)
            .setAlpha(0);

        // Fade in
        this.scene.tweens.add({
            targets: this.currentText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Hold, then fade out
        this.scene.time.delayedCall(
            announcement.duration ?? 1200,
            () => {
                this.hideCurrent();
            }
        );
    }

    hideCurrent() {
        if (!this.currentText) {
            this.finish();
            return;
        }

        this.scene.tweens.add({
            targets: this.currentText,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                this.currentText.destroy();
                this.currentText = null;

                this.finish();
            }
        });
    }

    finish() {
        this.active = false;
        this.showNext();
    }
}