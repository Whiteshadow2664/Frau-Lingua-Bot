// Import the help command
const help = require('./commands/help');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Check if the message is from a DM (message.guild === null means it's a DM)
        if (message.guild === null) {
            // Don't respond if the message is from a bot
            if (message.author.bot) return;

            try {
                // Trigger the help command when a user sends a DM to the bot
                await help.execute(message);
            } catch (error) {
                console.error('Error responding to DM:', error);
            }
        }
    });
};