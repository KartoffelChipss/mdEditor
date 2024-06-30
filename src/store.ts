import Store from 'electron-store';

export default new Store({
    schema: {
        windowPosition: {
            type: 'object',
            properties: {
                width: {
                    type: 'number',
                },
                height: {
                    type: 'number',
                },
                x: {
                    type: 'number',
                },
                y: {
                    type: 'number',
                },
            },
            required: ['width', 'height', 'x', 'y'],
        },
    }
});