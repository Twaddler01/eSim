export const stageData = [
    // Cell Stage
    { id: 'cell', title: 'CELL STAGE',
        tabs: {
            gather: [
                { id: 'water', title: 'WATER', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'carbon', title: 'CARBON', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'hydrogen', title: 'HYDROGEN', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'water2', title: 'WATER', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'carbon2', title: 'CARBON', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'hydrogen2', title: 'HYDROGEN', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'water3', title: 'WATER', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'carbon3', title: 'CARBON', amount: 0, max: 100, actionLabel: 'GATHER' },
                { id: 'hydrogen3', title: 'HYDROGEN', amount: 0, max: 100, actionLabel: 'GATHER' }
            ],
            create: [
                { id: 'water_molecule', title: 'Water Molecule', requirements: { water: 5 }, produces: { water_molecule: 1 }, actionLabel: 'CREATE' },
                { id: 'water_molecule2', title: 'Water Molecule dx2', requirements: { water: 15 }, produces: { water_molecule: 2 }, actionLabel: 'CREATE' }
            ],
            discover: [
                { id: 'coming_soon', title: 'COMING SOON', amount: 0, max: 1, actionLabel: 'DISCOVER' }
            ]
        }
    }
];