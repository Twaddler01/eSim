// dataFunctions.js
import { getItemMax } from '../utils/stageHelpers.js';

export function getCurrentTabCardData(
    tab,
    subTab,
    stageProgress,
    autoGather,
    stageItems
) {

    if (
        tab === 'create' &&
        subTab === 'upgrades'
    ) {
        return getCreateUpgradesCardData(
            stageProgress,
            autoGather
        );
    }

    let cards =
        stageItems.filter(
            item => item.tab === tab
        );

    if (tab === 'discover') {

        const objectiveCards =
            stageProgress.getObjectiveData();

        cards = [
            ...objectiveCards,
            ...cards
        ];
    }

    cards =
        cards.map(item =>
            buildCardData(
                item,
                tab,
                subTab,
                stageProgress
            )
        );

    return sortTabCards(
        cards,
        tab,
        subTab
    );
}

// helper ^ getCurrentTabCardData
function buildCardData(
    item,
    tab,
    subTab,
    stageProgress
) {
    return {
        ...item,

        subTab: subTab ?? null,

        // LIVE DATA
        getAmount: () =>
            stageProgress.get(item.id),

        getMax: () =>
            getItemMax(
                item,
                stageProgress
            ),

        getNextMax: () =>
            getItemMax(
                item,
                stageProgress,
                'next'
            ),

        getUpgradeStats: () =>
            stageProgress.getGatherUpgradeStats(
                item.id,
                item
            ),

        getAvailability: () =>
            stageProgress.getAvailability(
                item,
                tab
            ),

        getCreateData:
            item.tab === 'create'
                ? () =>
                stageProgress.getCreateData(item)
                : null,

        // ACTIONS
        canUpgrade:
            () =>
                stageProgress.gatherUpgradeAvailable(item),

        onUpgrade:
            () =>
                stageProgress.upgradeGather(item),

        canAction:
            () =>
                stageProgress.getCardCanAction(item),

        onAction:
            () =>
                stageProgress.handleCardAction(
                    item,
                    tab
                )
    };
}

// helper ^ getCurrentTabCardData
function sortTabCards(
    cards,
    tab,
    subTab
) {

    switch (tab) {
        case 'gather':
            return sortGatherCards(cards);

        case 'create':
            return cards;
            // WIP return sortCreateCards(cards, subTab);

        case 'discover':
            return cards;
            // WIP return sortDiscoverCards(cards);

        default:
            return cards;
    }
}

// helper ^ sortTabCards
function sortGatherCards(cards) {
    return [...cards].sort(
        (a, b) =>
            getGatherOrder(a.availability) -
            getGatherOrder(b.availability)
    );
}

// helper ^ sortGatherCards
function getGatherOrder(availability) {
    return {
        active: 0,
        insufficient: 0,
        maxed: 0,
        locked: 1
    }[availability] ?? 999;
}

// ==========================================
// CREATE (UPGRADE - sub tab)
// ==========================================

// WIP
export function getCreateUpgradesCardData(
    stageProgress,
    autoGather
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

        getAvailability:
            () =>
                stageProgress.getUpgradeAvailability(upgrade),
        
        getLevel: 
            () =>
                stageProgress.getAutoGatherAmount(upgrade.item),
        
        canAction:
            () =>
                stageProgress.getCardCanAction(upgrade),
        
        onAction: () => {
            const level =
                stageProgress.upgradeAutoGather(
                    upgrade.item
                );
            autoGather.setActive(
                upgrade.item,
                level
            );
        },
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