// commands/updates.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    execute: async (message) => {
        // You can modify the updates as needed
        const updates = [
            {
                title: 'Update 1: New Quiz Languages Added!',
                description: 'We have added support for new languages in our vocabulary quizzes! Try them now!'
            },
            {
                title: 'Update 2: Improved Leaderboard System',
                description: 'The leaderboard now shows the top moderators and their points more clearly.'
            },
            {
                title: 'Update 3: !updates Command Added',
                description: 'A new command, **!updates**, has been added to show all the latest updates about the bot.'
            },
            // Add more updates here as necessary
        ];

        const embed = new EmbedBuilder()
            .setTitle('Bot Updates')
            .setColor('#00ff00') // You can choose any color
            .setDescription('Here are the latest updates about the bot:')
            .addFields(
                updates.map(update => ({
                    name: update.title,
                    value: update.description
                }))
            )
            .setFooter({ text: 'Stay tuned for more updates!' });

        // Send the embed in the channel
        await message.channel.send({ embeds: [embed] });
    }
};