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
    { stage: 'creation', id: 'helium', title: 'HELIUM', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'oxygen', title: 'OXYGEN', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'silicon', title: 'SILICON', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'aluminum', title: 'ALUMINUM', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'iron', title: 'IRON', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'nitrogen', title: 'NITROGEN', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { stage: 'creation', id: 'neon', title: 'NEON', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },

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