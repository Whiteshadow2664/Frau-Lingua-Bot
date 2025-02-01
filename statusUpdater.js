const { Client, ActivityType } = require('discord.js');

let statuses = [
    { type: ActivityType.Playing, text: 'with code' },
    { type: ActivityType.Listening, text: 'to your requests' },
    { type: ActivityType.Watching, text: 'over the server' },
    { type: ActivityType.Competing, text: 'in a game' }
];

let currentStatusIndex = 0;

async function updateBotStatus(client) {
    try {
        // Set the bot's status to the current one
        const status = statuses[currentStatusIndex];
        await client.user.setActivity(status.text, { type: status.type });

        // Cycle through statuses every 10 seconds
        currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    } catch (error) {
        console.error('Error updating bot status:', error);
    }
}

module.exports = { updateBotStatus };