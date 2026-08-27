// dataFunctions.js
import { getItemMax } from '../utils/stageHelpers.js';
import { stageItems, stageObjectives } from '../data/stageData.js';

export function getCurrentTabCardData(
    tab,
    subTab,
    stageProgress,
    autoGather
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

        const discoverCards =
            getDiscoverCardData(stageProgress);

        cards = [
            ...discoverCards,
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
            return sortByAvailability(cards, {
                active: 0,
                insufficient: 0,
                maxed: 0,
                locked: 1
            });

        case 'create':
            return cards;
            // WIP return sortCreateCards(cards, subTab);

        case 'discover':
            return sortByAvailability(cards, {
                active: 0,
                completed: 1,
                locked: 2
            });

        default:
            return cards;
    }
}

// AVAILABILITY SORT ^ sortTabCards
export function sortByAvailability(
    data,
    order
) {
    return [...data].sort(
        (a, b) =>
            (order[a.getAvailability()] ?? 999) -
            (order[b.getAvailability()] ?? 999)
    );
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
    stageProgress
) {
    const returnData = [];
    stageObjectives.forEach(obj => {

        // Only include these types
        if (obj.type !== 'objective' &&
            obj.type !== 'child' &&
            obj.type !== 'parent') {
            return;
        }
        
        // New data only
        const data = {
            id: obj.id,
            title: obj.title,
            tab: 'discover',
            objectiveText: obj.objectiveText,
            description: obj.description,
            
            required: {
                items: [],
                objectives: [],
                children: []
            },

            unlocked: {
                items: [],
                objectives: [],
                children: []
            }
        };

        // ==========================================
        // REQUIRED
        // ==========================================

        if (obj.requirements?.items) {
            data.required.items =
                fetchObjData(obj.requirements.items);
        }
        
        if (obj.objectiveText) {
            data.required.items = [
                { 
                    id: 'startsUnlocked',
                    title: obj.objectiveText,
                    amt: 0
                }
            ];
        }

        if (obj.requirements?.objectives) {
            data.required.objectives =
                fetchObjData(obj.requirements.objectives);
        }

        // Parent children
        if (obj.children) {
            data.required.children =
                fetchObjData(obj.children);
        }

        // ==========================================
        // UNLOCKED
        // ==========================================

        if (obj.unlocks?.items) {
            data.unlocked.items =
                fetchObjData(obj.unlocks.items);
        }

        if (obj.unlocks?.objectives) {
            data.unlocked.objectives =
                fetchObjData(obj.unlocks.objectives);
        }

        if (obj.unlocks?.children) {
            data.unlocked.children =
                fetchObjData(obj.unlocks.children);
        }

        returnData.push(data);

        // TEST SORT
        const order = {
            active: 0,
            completed: 1,
            locked: 2
        };
    
        returnData.sort(
            (a, b) =>
                order[a.availability] -
                order[b.availability]
        );

    });

    return returnData;
}

// Helper ^ getDiscoverCardData
function fetchObjData(data) {
    if (!Array.isArray(data)) return [];
    return data.flatMap(item => {
        // ID only
        if (typeof item === 'string') {
            return {
                id: item,
                title: getTitle(item)
            };
        }
        // ID + amount
        if (item && typeof item === 'object') {
            return Object.entries(item).map(([id, amt]) => ({
                id,
                title: getTitle(id),
                amt
            }));
        }
        return [];
    });
}

// Gwt any title matching id
function getTitle(id) {
    const stage = stageItems.find(i => i.id === id);
    if (stage) return stage.title;
    const objective = stageObjectives.find(i => i.id === id);
    if (objective) return objective.title;
    return id;
}