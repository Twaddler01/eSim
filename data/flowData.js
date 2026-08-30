// unlockDelay = 2000 for objective complete delay
export const flowData = [
    {
        // Matches [id] in stageObjectives
        id: 'the_beginning',
        steps: [
            {
                type: 'announcement',
                id: 'obj_done_the_beginning',
                delay: 0
            },
            /*{
                type: 'conversation',
                id: 'the_beginning_complete',
                delay: 1000
            },
            {
                type: 'announcement',
                id: 'obj_new_days_of_creation',
                delay: 1000
            }*/
        ]
    },
    /*{
        id: 'creation_day_1',
        steps: [
            {
                type: 'conversation',
                id: 'creation_day_1_complete',
                delay: 2000
            }
        ]
    }*/
];