export default class AutoGatherManager {

    constructor(onGather) {

        this.onGather = onGather;

        this.interval = 1000;
        this.accumulator = 0;

        this.activeItem = null;
    }

    setActive(itemId) {
        this.activeItem = itemId;
        
        jp('AUTO GATHER ACTIVE:' + itemId);
    }

    update(delta) {

        if (!this.activeItem) {
            return;
        }

        this.accumulator += delta;

        if (this.accumulator < this.interval) {
            return;
        }

        this.accumulator -= this.interval;

        this.gather();
    }

    gather() {
        jp('AUTO GATHER:' + this.activeItem);
        this.onGather?.(this.activeItem);
    }
}

// TEST INTERVAL
/*export default class AutoGatherManager {

    constructor(stageProgress) {

        this.stageProgress = stageProgress;

        this.interval = 1000;
        this.accumulator = 0;
    }

    update(delta) {

        this.accumulator += delta;

        if (this.accumulator < this.interval) {
            return;
        }

        this.accumulator -= this.interval;

        this.gather();
    }

    gather() {

        // Test first
//console.log('AUTO GATHER');

        // Eventually:
        // this.stageProgress.add(...);
    }
}*/

// VERSION 1
/*export default class AutoGatherManager {

    constructor(stageProgress, gameTimer) {

        this.stageProgress = stageProgress;
        this.gameTimer = gameTimer;

        this.interval = 1000; // 1 gather per second
        this.accumulator = 0;

    }

    update(delta) {

        this.accumulator += delta;

        while (this.accumulator >= this.interval) {

            this.accumulator -= this.interval;

            this.gather();

        }
    }

    gather() {

        // However you currently determine active
        // auto-gather upgrades.
        const autoGather = this.stageProgress.getAutoGatherData();

        if (!autoGather) return;

        for (const item of autoGather) {

            if (!item.amount) continue;

            this.stageProgress.add(
                item.id,
                item.amount
            );
        }
    }
}*/