export const stageData = [
    // Cell Stage
    {
        id: 'cell',
        title: 'CELL STAGE',

        tabs: {

            gather: [
                {
                    id: 'water',
                    title: 'WATER',
                    amount: 0,
                    max: 100,
                    actionLabel: 'GATHER'
                },

                {
                    id: 'carbon',
                    title: 'CARBON',
                    amount: 0,
                    max: 100,
                    actionLabel: 'GATHER'
                },

                {
                    id: 'hydrogen',
                    title: 'HYDROGEN',
                    amount: 0,
                    max: 100,
                    actionLabel: 'GATHER'
                }
            ],


            discover: [
                {
                    id: 'unknown',
                    title: 'UNKNOWN SUBSTANCE',
                    amount: 0,
                    max: 10,
                    actionLabel: 'EXPLORE'
                },

                {
                    id: 'cosmic_dust',
                    title: 'COSMIC DUST',
                    amount: 0,
                    max: 25,
                    actionLabel: 'EXPLORE'
                }
            ],


            more: [
                {
                    id: 'coming_soon',
                    title: 'COMING SOON',
                    amount: 0,
                    max: 1,
                    actionLabel: '---'
                }
            ]
        }
    }
];