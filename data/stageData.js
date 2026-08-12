export const stageData = [
    // Stage
    { id: 'creation', title: '== CREATION STAGE ==', scene: 'CreationScene', stage: 0 },
    { id: 'early_humanity', title: '== EARLY HUMANITY STAGE ==', scene: 'MainScene', stage: 1 }
];

export const stageItems = [

// Resources
    { stage: 'creation', id: 'darkness', title: 'DARKNESS', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'light', title: 'LIGHT', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'water', title: 'WATER', tab: 'gather', category: 'element', unlocked: false, max: 50, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                rateIncrease: 0.2 // caps before max
            }
        },
    },
    { stage: 'creation', id: 'carbon', title: 'CARBON', tab: 'gather', category: 'element', unlocked: false, max: 20, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 50,
                rateIncrease: 2
            }
        },
    },
    { stage: 'creation', id: 'hydrogen', title: 'HYDROGEN', tab: 'gather', category: 'element', unlocked: false, max: 20, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 200,
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

// Creation
    { stage: 'creation', id: 'water_molecule', title: 'Water Molecule', tab: 'create', category: 'molecule', unlocked: true,
        requirements: {
            water: 5
        },
        produces: {
            water_molecule: 1
        }, actionLabel: 'CREATE' },
    { stage: 'creation', id: 'water_molecule2', title: 'Water Molecule dx2', tab: 'create', category: 'molecule', unlocked: true,
        requirements: {
            water: 15,
            carbon: 1
        },
        produces: {
            water_molecule2: 4
        }, actionLabel: 'CREATE' },

// Discoveries
    {
        id: 'the_beginning',
        title: 'THE BEGINNING',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        stage: 'creation',
        startsUnlocked: true,
        tracked: true,
        description: 'In the beginning, God created....',
        // No requirements
        requirements: {},
        unlocks: { 
            master: [ 'creation' ],
            discoveries: [ 'creation_day_1' ],
            items: [ 'darkness' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        id: 'creation_day_1',
        title: 'LEARN DAY 1',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        stage: 'creation',
        description: 'Learning Day 1....',
        // No requirements
        requirements: { darkness: 10 },
        unlocks: { 
            discoveries: [ 'creation_day_2' ],
            items: [ 'light' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        id: 'creation_day_2',
        title: 'LEARN DAY 2',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        stage: 'creation',
        description: 'Learning Day 2....',
        // No requirements
        requirements: { light: 10 },
        unlocks: { 
            discoveries: [ 'creation_day_3' ],
            items: [ 'water' ],
        },
        actionLabel: 'COMPLETE'
    },
    {
        id: 'creation_day_3',
        title: 'LEARN DAY 3',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        stage: 'creation',
        description: 'Learning Day 3....',
        // No requirements
        requirements: { water: 10 },
        unlocks: { 
            discoveries: [ 'creation_day_4' ],
            items: [ 'carbon' ],
        },
        actionLabel: 'COMPLETE'
    }
];

export const masterObjectives = [
    {
        id: 'creation',
        title: 'CREATION',
        stage: 'creation',
        description: 'Complete all six days of Creation.',

        objectives: [
            'creation_day_1',
            'creation_day_2',
            'creation_day_3',
            'creation_day_4',
            'creation_day_5',
            'creation_day_6'
        ],
        unlocks: {
            discoveries: [
                'early_humanity'
            ]
        }
    }
];

// NEW WIP

/* STATUS OPTIONS:
LOCKED
UNLOCKED
AVAILABLE
ACTIVE
COMPLETED

getObjectiveStatus(objective)
{
    status: 'available',
    unlocked: true,
    available: true,
    complete: false,
    tracked: true
}
LOCKED — objective hasn't been unlocked
UNLOCKED — unlocked, but requirements aren't met
AVAILABLE — requirements are met and can be completed
COMPLETED — requirements were completed / action was performed
tracked — not a status, but whether it appears in the tracker
*/
// type: parent, child, objective
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
        tracked: true,
        description: 'Complete all six days of Creation.',
        requirements: {}, // Other requirements still possible, only items for now, objective requirements will rely on other unlocks.objective
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
        tracked: true,
        startsUnlocked: true,
        description: '"In the beginning, God created...."',
        requirements: {},
        unlocks: { 
            objectives: [ 'days_of_creation', "creation_day_1" ],
            items: [ 'darkness' ] // for testing purposes
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_1',
        title: 'CREATION DAY 1',
        stage: 'creation',
        tracked: true,
        description: 'Day 1 description....',
        requirements: {
            items: [ { darkness: 10 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_2' ], // other objectives can be unlocked too
            items: [ 'light' ]
        },
        actionLabel: 'COMPLETE'
    },
    {
        // Child objective (no parent, child: true, has parentId)
        type: 'child',
        parentId: 'days_of_creation',
        id: 'creation_day_2',
        title: 'CREATION DAY 2',
        stage: 'creation',
        tracked: true,
        description: 'Day 2 description....',
        requirements: {
            items: [ { light: 10 } ], // multiple allowed
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
        tracked: true,
        description: 'Day 3 description....',
        requirements: {
            items: [ { water: 10 } ], // multiple allowed
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
        tracked: true,
        description: 'Day 4 description....',
        requirements: {
            items: [ { carbon: 10 } ], // multiple allowed
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
        tracked: true,
        description: 'Day 5 description....',
        requirements: {
            items: [ { hydrogen: 10 } ], // multiple allowed
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
        tracked: true,
        description: 'Day 6 description....',
        requirements: {
            items: [ { helium: 10 } ], // multiple allowed
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
        tracked: true,
        description: 'Day 7 description....',
        requirements: {
            items: [ { oxygen: 10 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { // no unlocks, testing for no active objectivs
            objectives: [],
            items: []
        },
        actionLabel: 'COMPLETE'
    }
];