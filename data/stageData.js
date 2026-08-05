export const stageData = [
    // Cell Stage
    { id: 'cell', title: 'CELL STAGE' }
];

export const stageItems = [

    // Elements
    { id: 'water', title: 'WATER', tab: 'gather', category: 'element', unlocked: true, max: 10, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 20,
                rateIncrease: 1
            }
        },
    },
    { id: 'carbon', title: 'CARBON', tab: 'gather', category: 'element', unlocked: true, max: 20, actionLabel: 'GATHER',
        gather: {
            upgrade: {
                enabled: true,
                maxIncrease: 50,
                rateIncrease: 2
            }
        },
    },
    { id: 'hydrogen', title: 'HYDROGEN', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'helium', title: 'HELIUM', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'oxygen', title: 'OXYGEN', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'silicone', title: 'SILICONE', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'aluminum', title: 'ALUMINUM', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'iron', title: 'IRON', tab: 'gather', category: 'element', unlocked: true, max: 100, actionLabel: 'GATHER' },
    { id: 'nitrogen', title: 'NITROGEN', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },
    { id: 'neon', title: 'NEON', tab: 'gather', category: 'element', unlocked: false, max: 100, actionLabel: 'GATHER' },

    // Molecules
    { id: 'water_molecule', title: 'Water Molecule', tab: 'create', category: 'molecule', unlocked: true,
        requirements: {
            water: 5
        },
        produces: {
            water_molecule: 1
        }, actionLabel: 'CREATE' },
    { id: 'water_molecule2', title: 'Water Molecule dx2', tab: 'create', category: 'molecule', unlocked: true,
        requirements: {
            water: 15,
            carbon: 1
        },
        produces: {
            water_molecule2: 4
        }, actionLabel: 'CREATE' },

    // Discoveries
    { id: 'coming_soon', title: 'COMING SOON', tab: 'discover', category: 'discovery', unlocked: false, max: 1, actionLabel: 'DISCOVER' }
];