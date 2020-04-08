const matrix = require('matrix-js-sdk');
const striptags = require('striptags');

const client = {
    init: function() {
        // Init Matrix client
        this.connection = matrix.createClient({
            baseUrl: process.env.MATRIX_HOMESERVER_URL,
            accessToken: process.env.MATRIX_TOKEN,
            userId: process.env.MATRIX_USER,
            localTimeoutMs: 10000,
        });

        // Ensure in right rooms
        this.connection.getJoinedRooms().then(rooms => {
            const joinedRooms = rooms.joined_rooms;
            const roomConfigs = process.env.MATRIX_ROOMS.split('|');
            roomConfigs.forEach(roomConfig => {
                const room = roomConfig.split('/');
                if (joinedRooms.indexOf(room[1]) === -1) {
                    client.connection.joinRoom(room[1]);
                }
            });
        });
    },
    sendEvent: function(roomId, event) {
        try {
            this.connection.sendEvent(
                roomId,
                'm.room.message',
                {
                    'body': striptags(event),
                    'formatted_body': event,
                    'msgtype': 'm.text',
                    'format': 'org.matrix.custom.html'
                },
                '',
            );
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    },
};

module.exports = client;
