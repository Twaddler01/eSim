export const stageData = [
    // Cell Stage
    { id: 'cell', title: 'CELL STAGE' }
];

export const stageItems = [

    // Elements
    { id: 'water', title: 'WATER', tab: 'gather', category: 'element', unlocked: false, max: 10, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                rateIncrease: 0.2 // caps before max
            }
        },
    },
    { id: 'carbon', title: 'CARBON', tab: 'gather', category: 'element', unlocked: false, max: 20, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 50,
                rateIncrease: 2
            }
        },
    },
    { id: 'hydrogen', title: 'HYDROGEN', tab: 'gather', category: 'element', unlocked: false, max: 20, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 200,
            }
        },
    },
    { id: 'helium', title: 'HELIUM', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'oxygen', title: 'OXYGEN', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'silicon', title: 'SILICON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'aluminum', title: 'ALUMINUM', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'iron', title: 'IRON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'nitrogen', title: 'NITROGEN', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'neon', title: 'NEON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },

    // Molecules
    { id: 'water_molecule', title: 'Water Molecule', tab: 'create', category: 'molecule', unlocked: false,
        requirements: {
            water: 5
        },
        produces: {
            water_molecule: 1
        }, actionLabel: 'CREATE' },
    { id: 'water_molecule2', title: 'Water Molecule dx2', tab: 'create', category: 'molecule', unlocked: false,
        requirements: {
            water: 15,
            carbon: 1
        },
        produces: {
            water_molecule2: 4
        }, actionLabel: 'CREATE' },

    // Discoveries
    //{ id: 'coming_soon', title: 'COMING SOON', tab: 'discover', category: 'discovery', unlocked: false, max: 1, actionLabel: 'DISCOVER' }
    {
        id: 'big_bang',
        title: 'BIG BANG',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        startsUnlocked: true,
        tracked: true,
        description: 'The beginning of the universe.',
        // No requirements
        requirements: { initial: 0 },
        unlocks: { 
            discoveries: ['primodial_soup'],
            items: [ 'water', 'carbon', 'hydrogen' ],
        },
        actionLabel: 'UNLOCK'
    },
    {
        id: 'primodial_soup',
        title: 'PRIMORDIAL SOUP',
        tab: 'discover',
        category: 'discovery',
        discovery: true,
        unlocked: false,
        description: 'It could stir up something interesting.',
        requirements: { 
            water: 50,
            carbon: 25,
            hydrogen: 10
        },
        unlocks: {},
        actionLabel: 'UNLOCK'
    }
];