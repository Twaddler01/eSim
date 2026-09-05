export const stageData = [
    // Stage
    { id: 'creation', title: '== CREATION STAGE ==', scene: 'CreationScene', stage: 0 },
    { id: 'early_humanity', title: '== EARLY HUMANITY STAGE ==', scene: 'MainScene', stage: 1 }
];

export const subTabs = {
    gather: null,

    create: [
        { id: 'items', label: 'ITEMS' },
        { id: 'upgrades', label: 'UPGRADES' }
    ],

    discover: null
};

export const stageItems = [

// Resources
    { stage: 'creation', id: 'darkness', title: 'DARKNESS', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER',
        autoReq: {
            darkness: 5,
            light: 5
        }
    },
    { stage: 'creation', id: 'light', title: 'LIGHT', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER',
        autoReq: {
            light: 5,
            water: 5
        }
    },
    { stage: 'creation', id: 'water', title: 'WATER', tab: 'gather', category: 'element', unlocked: false, max: 15, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                rateIncrease: 0.2, // caps before max
                /*cost: [
                    { water: max * 0.9 }, // see StageProgressManager => getGatherUpgradeStats()
                ],*/
            }
        },
    },
    { stage: 'creation', id: 'carbon', title: 'CARBON', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 50,
                rateIncrease: 2
            }
        },
    },
    { stage: 'creation', id: 'hydrogen', title: 'HYDROGEN', tab: 'gather', category: 'element', unlocked: false, max: 15, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 200,
                rateIncrease: 3
            }
        },
    },
    { stage: 'creation', id: 'helium', title: 'HELIUM', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'oxygen', title: 'OXYGEN', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'silicon', title: 'SILICON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'aluminum', title: 'ALUMINUM', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'iron', title: 'IRON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'nitrogen', title: 'NITROGEN', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'neon', title: 'NEON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'the_void', title: 'THE VOID', tab: 'gather', category: 'element', unlocked: false, max: 1, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'dark_matter', title: 'DARK MATTER', tab: 'gather', category: 'element', unlocked: false, max: 200, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'dark_energy', title: 'DARK ENERGY', tab: 'gather', category: 'element', unlocked: false, max: 200, actionLabel: 'GATHER' },
    // Created items only WIP
    //{ created: true, stage: 'creation', id: 'c_water_molecule', title: 'WATER MOLECULE', tab: 'gather', category: "element", max: 10, actionLabel: 'GATHER' },
    //{ created: true, stage: 'creation', id: 'c_black_hole', title: 'BLACK HOLE', tab: 'gather', category: "element", max: 10, actionLabel: 'GATHER' },

// Creates
    { stage: 'creation', id: 'air', title: 'Air', description: 'Useful for life.', tab: 'create', category: "created",
        requirements: {
            water: 1,
            light: 1
        },
        produces: {
            air: 1
        }, actionLabel: 'CREATE'
    },
    { stage: 'creation', id: 'space', title: 'Space', description: 'As if you need more..', tab: 'create', category: "created",
        requirements: {
            darkness: 5
        },
        produces: {
            space: 314
        }, actionLabel: 'CREATE'
    },
    { stage: 'creation', id: 'water_molecule', title: 'Water Molecule', description: 'Seems useful.', tab: 'create', category: "created",
        requirements: {
            water: 5,
            hydrogen: 10
        },
        produces: {
            water_molecule: 1
        }, actionLabel: 'CREATE'
    },
    { stage: 'creation', id: 'water_molecule2', title: 'Water Molecule dx2', description: 'A "different" liquid.', tab: 'create', category: "created",
        requirements: {
            water: 15,
            carbon: 1,
            water_molecule: 1
        },
        produces: {
            water_molecule: 4
        }, actionLabel: 'CREATE'
    },
    { stage: 'creation', id: 'black_hole', title: 'Black Hole', description: 'The potential for something.', tab: 'create', category: "created",
        requirements: {
            dark_matter: 100,
            the_void: 1
        },
        produces: {
            black_hole: 1,
            dark_energy: 100
        }, actionLabel: 'CREATE'
    }
];

export const stageObjectives = [
    {
        // Parent objective (parent: true, children: [])
        type: 'parent',
        children: [
            'creation_day_1',
            'creation_day_2',
            'creation_day_3',
            'creation_day_4',
            'creation_day_5',
            'creation_day_6'
        ],
        id: 'days_of_creation',
        title: 'DAYS OF CREATION',
        stage: 'creation',
        tab: 'discover',
        description: 'Complete all six days of Creation.',
        requirements: { 
            items: [ { darkness: 5 } ]
        }, // Other requirements still possible, only items for now, objective requirements will rely on other unlocks.objective
        unlocks: {
            objectives: [ 'creation_day_7' ],
            items: []
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Regular objective (no parent, no children)
        type: 'objective',
        id: 'the_beginning',
        title: 'THE BEGINNING',
        stage: 'creation',
        tab: 'discover',
        startsUnlocked: true,
        objectiveText: 'Learn About: THE BEGINNING',
        description: '"In the beginning, God created...."',
        requirements: {},
        unlocks: { 
            objectives: [ 'days_of_creation', 'creation_day_1', 'gatherUpLight', 'gatherUpDarkness' ],
            items: [ 'darkness' ], // for testing purposes
        },
        hasFlow: true,
        /*triggers: {
            announcements: [
                {
                    id: 'obj_done_the_beginning',
                    delay: 0
                },
                {
                    id: 'obj_new_days_of_creation',
                    delay: 6000
                }
            ],
            conversation: {
                id: 'the_beginning_complete',
                delay: 3000
            }
        },*/
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_1',
        title: 'CREATION DAY 1',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 1 description....',
        requirements: {
            items: [ { darkness: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_2' ], // other objectives can be unlocked too
            items: [ 'light', 'water' ]
        },
        hasFlow: true,
        /*triggers: {
            conversation: {
                id: 'creation_day_1_complete',
                delay: 1200
            }
        },*/
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_2',
        title: 'CREATION DAY 2',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 2 description....',
        requirements: {
// testing water
            items: [ { light: 5 }, { water: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_3' ], // other objectives can be unlocked too
            items: [ 'water' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_3',
        title: 'CREATION DAY 3',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 3 description....',
        requirements: {
            items: [ { water: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_4' ], // other objectives can be unlocked too
            items: [ 'carbon' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_4',
        title: 'CREATION DAY 4',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 4 description....',
        requirements: {
            items: [ { carbon: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_5' ], // other objectives can be unlocked too
            items: [ 'hydrogen' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_5',
        title: 'CREATION DAY 5',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 5 description....',
        requirements: {
            items: [ { hydrogen: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_6' ], // other objectives can be unlocked too
            items: [ 'helium' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_6',
        title: 'CREATION DAY 6',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 6 description....',
        requirements: {
            items: [ { helium: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [], // parent will unlock next one
            items: [ 'oxygen' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        type: 'objective',
        id: 'creation_day_7',
        title: 'CREATION DAY 7',
        stage: 'creation',
        tab: 'discover',
        description: 'Day 7 description....',
        requirements: {
            items: [ { oxygen: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { // no unlocks, testing for no active objectivs
            objectives: [],
            items: []
        },
        actionLabel: 'COMPLETE'
    },
    {
        type: 'objective',
        id: 'gatherUpLight',
        title: 'Gather Up: Light',
        stage: 'creation',
        tab: 'discover',
        description: 'Gather 10 light....',
        requirements: {
            items: [ { light: 10 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { // no unlocks, testing for no active objectivs
            objectives: [],
            items: []
        },
        actionLabel: 'COMPLETE'
    },
    {
        type: 'objective',
        id: 'gatherUpDarkness',
        title: 'Gather Up: Darkness',
        stage: 'creation',
        tab: 'discover',
        description: 'Gather 10 darkness....',
        requirements: {
            items: [ { darkness: 10 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { // no unlocks, testing for no active objectivs
            objectives: [],
            items: []
        },
        actionLabel: 'COMPLETE'
    }
];

//////////////////////////////////////////
// ORGANIZE ARRAYS
//////////////////////////////////////////

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

//////////////////////////////////////////

function f_creationStage_gatherCards() {
    const data = stageItems.filter(item => item.tab === 'gather');
    return data;
}

function f_creationStage_createItemsCards() {
    const data = stageItems.filter(item => item.tab === 'create');
    data.forEach(item => {
        item.subTab = 'items';
    });
    return data;
}

function f_creationStage_createUpgradesCards() {
    const data = [];
    
    stageItems.forEach(item => {
        const requirements = getRequirements(item.autoReq, stageItems);
        
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

// Modded data for ui display purposes
function f_creationStage_discoverCards() {
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
            ...obj,
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

//////////////////////////////////////////
// HELPERS
//////////////////////////////////////////

// helper ^ fetchObjData ^ f_creationStage_discoverCards
// Gwt any title matching id
function getTitle(id) {
    const nonDiscoverCards = [
        ...gatherCards,
        ...createItemsCards,
        ...createUpgradesCards,
    ];
    
    const item = nonDiscoverCards.find(i => i.id === id);
    if (!item) return;

    return item.title ?? item.id;
}

// Helper ^ f_creationStage_discoverCards
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

// ALL CREATION STAGE CARDS
export const gatherCards = f_creationStage_gatherCards();
export const createItemsCards = f_creationStage_createItemsCards();
export const createUpgradesCards = f_creationStage_createUpgradesCards();
export const discoverCards = f_creationStage_discoverCards();

export const allCardData = [
    ...gatherCards,
    ...createItemsCards,
    ...createUpgradesCards,
    ...discoverCards
];