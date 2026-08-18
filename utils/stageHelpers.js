export function getItemMax(item, stageProgress, extra) {
    const baseMax =
        item.max;

    if (baseMax == null) {
        return null;
    }

    const upgrade =
        item.gather?.upgrade;

    if (
        !upgrade ||
        upgrade.enabled === false ||
        (upgrade.maxIncrease ?? 0) <= 0
    ) {
        return baseMax;
    }

    const level =
        stageProgress.getGatherLevel(item.id);

    const effectiveLevel =
        extra === 'next'
            ? level + 1
            : level;

    return (
        baseMax +
        effectiveLevel *
        upgrade.maxIncrease
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