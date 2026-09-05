// dataFunctions.js
import { getItemMax } from '../utils/stageHelpers.js';
import { stageItems, stageObjectives } from '../data/stageData.js';
import { 
    gatherCards, 
    createItemsCards,
    createUpgradesCards,
    discoverCards
} from '../data/stageData.js';

function getCards(tab, subTab) {
    const cardsByTab = {
        gather: gatherCards,
        create: {
            items: createItemsCards,
            upgrades: createUpgradesCards
        },
        discover: discoverCards
    };

    return cardsByTab[tab]?.[subTab]
        ?? cardsByTab[tab]
        ?? [];
}

// DEBUG
let runOnce = true;

export function getCurrentTabCardData(
    tab,
    subTab,
    stageProgress,
    autoGather,
    objectivesManager
) {
    if (!runOnce) {
        //runOnce = false;

        const cardsTest = getCards(tab, subTab);
        cardsTest.forEach(item => {
            jp(item.id);
        });
    }

    let cards = stageItems.filter(item => item.tab === tab);

    // Custom array: create-upgrades tab
    if (
        tab === 'create' &&
        subTab === 'upgrades'
    ) {
        cards = getCreateUpgradesCardData(
            stageProgress
        );
    }

    // Discover (stageObjectives)
    if (tab === 'discover') {
        const discoverCards =
            getDiscoverCardData(objectivesManager);

        cards = discoverCards;
    }

    cards = cards
        .map(item =>
            buildCardData(
                item,
                tab,
                subTab,
                stageProgress,
                autoGather,
                objectivesManager
            )
            // WIP
        ); //.filter(card => card.getAvailability() !== 'locked' || card.tab === 'discover');

    return sortTabCards(
        cards,
        tab,
        subTab,
        objectivesManager
    );
}

// helper ^ getCurrentTabCardData
// build WITH functions
function buildCardData(
    item,
    tab,
    subTab,
    stageProgress,
    autoGather,
    objectivesManager
) {
    // FOR ALL TABS
    const data = {
        ...item,

        // Assign subTab id for CREATE -> ITEMS (subTab default)
        subTab: subTab ?? null,

        // Lock state
        getLockState: () =>
            stageProgress.getLockState(item),

        // LIVE DATA
        getAmount: () =>
            stageProgress.get(item.id),

        getMax: () =>
            getItemMax(item, stageProgress),

        getNextMax: () =>
            getItemMax(item, stageProgress, 'next'),

        // ACTIONS
        canAction: () =>
            stageProgress.getCardState(item) === 'active',

        onAction: () =>
            stageProgress.handleCardAction(item, tab),

        // UI HELPERS
        helpers: {
            actionButtonState
        }
    };

    if (tab === 'create' && subTab === 'upgrades') {
        tab = 'create-upgrwdes';
    }

    // SPECIAL CASES
    switch (tab) {
        case 'gather':
            data.getCardState = () =>
                stageProgress.getCardState(item);

            data.getGatherUpgradeStats = () =>
                stageProgress.getGatherUpgradeStats(item.id, item);

            data.canUpgrade = () =>
                stageProgress.gatherUpgradeAvailable(item);
            
            data.onUpgrade = () =>
                stageProgress.upgradeGather(item);
            break;
        case 'create':
            // Imcludes 'upgrades' subTab
            data.getCardState = () =>
                stageProgress.getCardState(item);
            
            const requiredItems = stageProgress.getAllItems();
            const requirements = getRequirements(item.requirements, requiredItems);
            data.getCardUpdates = () => 
                stageProgress.getCardUpdates(item, requirements);
            break;
        case 'create-upgrwdes':
            data.getCardUpdates = () => // Calculates unlock
                stageProgress.getCardUpdates(item, item.requirements);

            data.getCardState = () =>
                stageProgress.getCardState(item);
        
            data.getLevel = () =>
                stageProgress.getAutoGatherAmount(item.item);

            data.onAction = () => 
                onAction_createUpgrades(item, stageProgress, autoGather);
            break;
        case 'discover':
            data.getCardState = () =>
                objectivesManager.getObjectiveAvailability(item);
            break;
    }

    return data;
}

// helper ^ getCurrentTabCardData
function sortTabCards(
    cards,
    tab,
    subTab,
    objectivesManager
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
        case 'discover': {
            const sorted =
                sortByAvailability(cards, {
                    active: 0,
                    completed: 1,
                    locked: 2
                });
        
            const completed =
                sorted
                    .filter(card =>
                        card.getCardState() === 'completed'
                    )
                    .sort((a, b) =>
                        objectivesManager.getCompletionOrder(b.id) -
                        objectivesManager.getCompletionOrder(a.id)
                    );
        
            let completedIndex = 0;
        
            return sorted.map(card => {
        
                if (card.getCardState() === 'completed') {
                    return completed[completedIndex++];
                }
        
                return card;
            });
        }

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
            (order[a.getCardState()] ?? 999) -
            (order[b.getCardState()] ?? 999)
    );
}

// ==========================================
// CREATE (UPGRADE - sub tab)
// ==========================================

// WIP
export function getCreateUpgradesCardData(
    stageProgress
) {
    const data = [];
    
    const gatherItems = stageProgress.getGatherItems();
    gatherItems.forEach(item => {

        const requirements = getRequirements(item.autoReq, gatherItems);
        
        data.push({
            tab: 'create',
            // Must be assigned for default tab
            subTab: 'upgrades',
            id: item.id + '_gather_upgrade',
            title: item.title + ' UPGRADES',
            item: item.id, // item upgrade is for -- WIP customized
            requirements: requirements ?? false
        });
    });

    return data;
}

// Returns title with id/cost
// reqItemsData: expects array with id and title
// requiredItems: expects key-value pair of matching id and cost
function getRequirements(reqItemsData, requiredItems) {

    const reqData = [];
    
    const reqItems = reqItemsData ?? null;
    if (!reqItems) return false;
    Object.entries(reqItems).forEach(([req, amt]) => {
        const reqItem = requiredItems.find(i => i.id === req);
        reqData.push({
            id: reqItem.id,
            title: reqItem.title,
            amt: amt
        });
    });
    
    return reqData;
}
// USAGE
// const requirements = getRequirements(item.autoReq, gatherItems);

// ==========================================
// DISCOVER
// ==========================================

export function getDiscoverCardData(
    objectivesManager
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

function actionButtonState(state, element = {}, activeText, inactiveText) {

    const newState = {
        locked: {
            id: 'locked',
            display: 'LOCKED',
            text: '#777777',
            fill: 0x222222,
            stroke: 0x555555
        },
        
        maxed: {
            id: 'maxed',
            display: 'MAXED',
            text: '#777777',
            fill: 0x222222,
            stroke: 0x555555
        },
        
        active: {
            id: 'active',
            display: activeText ?? 'GATHER',
            text: '#ffffff',
            fill: 0x335533,
            stroke: 0x66aa66
        },

        // Gather upgrades
        notReady: {
            id: 'notReady',
            display: inactiveText ?? 'NOT READY',
            text: '#777777',
            fill: 0x222222,
            stroke: 0x555555
        }
    };
    
    const ui = newState[state];

    element.rectangle
        ?.setFillStyle(ui.fill)
        .setStrokeStyle(1, ui.stroke);

    element.text
        ?.setText(ui.display)
        .setColor(ui.text);
}
/* USAGE;
this.actionButtonState(data.availability, {
    rectangle: this.gatherUI.gatherButton,
    text: this.gatherUI.gatherButtonText
});
*/

function onAction_createUpgrades(item, stageProgress, autoGather) {
    const level =
        stageProgress.upgradeAutoGather(
            item.item, item.requirements
        );
    autoGather.setActive(
        item.item,
        level
    );
}

export function getTabAvailability(
    tab,
    stageProgress,
    autoGather,
    objectivesManager
) {
    // Discover is always available
    if (tab === 'discover') {
        return 'active';
    }

    const cards = stageItems.filter(
        item => item.tab === tab
    );

    const hasUnlockedCard = cards.some(item => {
        const card = buildCardData(
            item,
            tab,
            null,
            stageProgress,
            autoGather,
            objectivesManager
        );

        return card.getCardState() !== 'locked';
    });

    return hasUnlockedCard
        ? 'active'
        : 'locked';
}