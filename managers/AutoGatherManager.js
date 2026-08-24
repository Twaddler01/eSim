export default class AutoGatherManager {

    constructor(onGather) {

        this.onGather = onGather;

        this.interval = 1000;
        this.accumulator = 0;

        // itemId -> auto amount per tick
        this.activeItems = new Map();
    }

    setActive(itemId, autoAmt) {

        if (autoAmt <= 0) {
            this.activeItems.delete(itemId);
            return;
        }

        this.activeItems.set(itemId, autoAmt);
    }

    clear() {
        this.activeItems.clear();
    }

    update(delta) {

        if (this.activeItems.size === 0) {
            return;
        }

        this.accumulator += delta;

        while (this.accumulator >= this.interval) {

            this.accumulator -= this.interval;

            this.gather();
        }
    }

    gather() {

        for (const [itemId, autoAmt] of this.activeItems) {

            this.onGather?.(itemId, autoAmt);
        }
    }
}

/*
// VERSION 3
export default class AutoGatherManager {

    constructor(onGather) {

        this.onGather = onGather;

        this.interval = 1000;
        this.accumulator = 0;

        // itemId -> gather amount per interval
        this.activeItems = new Map();
    }

    setActive(itemId, amount = 1) {

        this.activeItems.set(
            itemId,
            amount
        );
    }

    removeActive(itemId) {

        this.activeItems.delete(itemId);
    }

    clear() {

        this.activeItems.clear();
    }

    isActive(itemId) {

        return this.activeItems.has(itemId);
    }

    update(delta) {

        if (this.activeItems.size === 0) {
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

        this.activeItems.forEach(
            (amount, itemId) => {

                this.onGather?.(
                    itemId,
                    amount
                );

            }
        );
    }
}

// VERSION 2
export default class AutoGatherManager {

    constructor(onGather) {

        this.onGather = onGather;

        this.interval = 1000;
        this.accumulator = 0;

        this.activeItem = null;
    }

    setActive(itemId) {
        this.activeItem = itemId;
        
        //jp('AUTO GATHER ACTIVE:' + itemId);
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
        this.onGather?.(this.activeItem);

        //jp('AUTO GATHER:' + this.activeItem);
    }
}

// TEST INTERVAL
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
}

*/