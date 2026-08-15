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
        }, actionLabel: 'CREATE'
    },
    { stage: 'creation', id: 'water_molecule2', title: 'Water Molecule dx2', tab: 'create', category: 'molecule', unlocked: true,
        requirements: {
            water: 15,
            carbon: 1
        },
        produces: {
            water_molecule2: 4
        }, actionLabel: 'CREATE'
    }
];

// NEW WIP

/* STATUS OPTIONS:
LOCKED
   ↓
UNLOCKED
   ↓ requirements satisfied
ACTIVE
   ↓ player completes it
COMPLETED
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
        tab: 'discover',
        description: 'Day 1 description....',
        requirements: {
            items: [ { darkness: 5 } ], // multiple allowed
            // other: [] // other types can be required later on, objective requirements will rely on other unlocks.objective
        },
        unlocks: { 
            objectives: [ 'creation_day_2' ], // other objectives can be unlocked too
// testing water
            items: [ 'light', 'water' ]
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
    }
];