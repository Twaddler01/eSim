export function getItemMax(item, stageProgress, mode) {

    const baseMax = item.max;
    
    // No max = unlimited
    if (baseMax == null) {
        return null;
    }

    const upgrade =
        item.gather?.upgrade;
        
    if (!upgrade?.enabled || !upgrade.maxIncrease) {
        return baseMax;
    }
    
    const level =
        stageProgress.getGatherLevel(item.id);

    // Gets next level max
    if (mode === 'next') {
        return baseMax + (level + 1) * upgrade.maxIncrease;
    }
    
    if (mode === 'stats') {
        return {
            maxIncrease: upgrade.maxIncrease,
            rateIncrease: upgrade.rateIncrease,
    
            currentMax:
                baseMax +
                level * upgrade.maxIncrease,
    
            nextMax:
                baseMax +
                (level + 1) * upgrade.maxIncrease
        };
    }

    return (
        baseMax +
        level * upgrade.maxIncrease
    );
}

export function listenToEvent(
    emitter,
    event,
    handler
) {

    emitter.on(event, handler);

    return () => {
        emitter.off(event, handler);
    };
}