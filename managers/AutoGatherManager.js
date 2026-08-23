export default class AutoGatherManager {

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
}


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