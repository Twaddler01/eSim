// flowData.js

export const flowData = {

    // Default, only runs whenever flow/objective id is not present here
    announceObjective: {
        steps: [
            {
                id: 'complete',
                type: 'announcement',
                delay: 0,
                data: {
                    text: 'OBJECTIVE COMPLETE!',
                    duration: 1200
                }
            },
            {
                id: 'unlock',
                type: 'announcement',
                delay: 1000,
                data: {
                    text: 'NEW OBJECTIVE AVAILABLE!',
                    duration: 1500
                }
            }
        ]
    },

    the_beginning: {
        steps: [
            {
                type: 'announcement',
                delay: 0,
                data: {
                    text: 'OBJECTIVE COMPLETE!',
                    duration: 1200
                }
            },
            {
                type: 'conversation',
                delay: 1000,
                data: {
                    id: 'congrats'
                }
            },
            {
                type: 'announcement',
                delay: 1000,
                data: {
                    text: 'NEW OBJECTIVE AVAILABLE!',
                    duration: 1500
                }
            }
        ]
    },

    creation_day_1: {
        steps: [
            {
                type: 'conversation',
                delay: 2000,
                data: {
                    id: 'creation_day_1_complete'
                }
            }
        ]
    }
};


export const conversationData = {

    congrats: {
        messages: [
            {
                speaker: 'God',
                text: 'Congratulations! It has begun!'
            },
            {
                speaker: 'God',
                text: 'But let us first start out simple..'
            }
        ]
    },

    creation_day_1_complete: {
        messages: [
            {
                speaker: 'God',
                text: 'And there was light.'
            }
        ]
    }
};