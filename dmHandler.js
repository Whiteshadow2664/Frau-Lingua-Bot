const help = require('./commands/help'); // Import the help command logic

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Check if the message is from a DM
        if (message.guild === null) {
            // Don't respond if the message is from a bot
            if (message.author.bot) return;

            try {
                // Trigger the help command when a user sends a DM to the bot
                await help.execute(message); // Call the same method that !help uses
            } catch (error) {
                console.error('Error responding to DM:', error);
            }
        }
    });
};