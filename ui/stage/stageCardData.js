// stageCardData.js
import { getItemMax } from '../../utils/stageHelpers.js';

// ==========================================
// GATHER
// ==========================================

export function getGatherCardData(
    items,
    stageProgress
) {

    const gatherItems =
        items.filter(
            item => item.tab === 'gather'
        );

    const data =
        gatherItems.map(item => ({

            ...item,

            amount:
                stageProgress.get(item.id),

            max:
                stageProgress.getItemMax(item),

            nextMax:
                stageProgress.getItemMax(
                    item,
                    'next'
                ),

            upgradeStats:
                stageProgress.getGatherUpgradeStats(
                    item.id,
                    item
                ),

            availability:
                stageProgress.getAvailability(
                    item,
                    'gather'
                ),

            canUpgrade:
                () =>
                    stageProgress.gatherUpgradeAvailable(
                        item
                    )
        }));

    return sortByAvailability(
        data,
        {
            active: 0,
            insufficient: 0,
            maxed: 0,
            locked: 1
        }
    );
}


// ==========================================
// CREATE (ITEMS - default sub tab)
// ==========================================

export function getCreateCardData(
    items,
    stageProgress
) {

    return items
        .filter(
            item => item.tab === 'create'
        )
        .map(item => ({

            ...item,

            amount:
                stageProgress.get(item.id),

            availability:
                stageProgress.getAvailability(
                    item,
                    'create'
                ),

            getCreateData:
                () =>
                    stageProgress.getCreateData(
                        item
                    )
        }));
}

// ==========================================
// CREATE (UPGRADE - sub tab)
// ==========================================

// WIP
export function getCreateUpgradesCardData(
    stageProgress
) {

    const addData = [];
    const gatherItems = stageProgress.getGatherItems();
    gatherItems.forEach(item => {
        addData.push({
            tab: 'create',
            subTab: 'upgrades',
            id: item.id + '_gather_upgrade',
            title: item.title + ' UPGRADES',
            item: item.id // item upgrade is for
        });
    })

    const returnData = addData.map(upgrade => ({
        ...upgrade,
        
        itemAmount:
            stageProgress.get(upgrade.item),

        availability:
            stageProgress.getUpgradeAvailability(
                upgrade
            )
    }));

    //jp(returnData);
    return returnData;
}

// ==========================================
// DISCOVER
// ==========================================

export function getDiscoverCardData(
    items,
    stageProgress
) {

    return items
        .filter(
            item => item.tab === 'discover'
        )
        .map(item => ({

            ...item,

            amount:
                stageProgress.get(item.id),

            availability:
                stageProgress.getAvailability(
                    item,
                    'discover'
                )
        }));
}


// ==========================================
// AVAILABILITY SORT
// ==========================================

export function sortByAvailability(
    data,
    order
) {

    return [...data].sort(
        (a, b) =>
            (order[a.availability] ?? 999) -
            (order[b.availability] ?? 999)
    );
}