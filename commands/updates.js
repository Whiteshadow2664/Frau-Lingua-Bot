const { EmbedBuilder } = require('discord.js');

module.exports = {
    execute: async (message) => {
        // Embed content
        const embed = new EmbedBuilder()
            .setTitle('Frau Lingua 1.0.7 - Update Information')
            .setColor('#acf508')
            .setThumbnail('https://cdn.discordapp.com/attachments/1278983067205373964/1352878627292840009/20250322_110548.png?ex=67df9de8&is=67de4c68&hm=824d6505b65b68cf268383a7839b77ed0fec15ca88a7a6cbd8c19e0b51ee59b4&')
            .setDescription('We are excited to introduce the latest updates for **Frau Lingua 1.0.7**! This release includes new commands, improved moderation tools, and enhanced features to support your language learning journey. Below are the complete details of the update:')
            .addFields(
                {
                    name: '🗓️ Date of Update',
                    value: '28 February 2025',
                    inline: false
                },
                {
                    name: '✨ New Features and Commands',
                    value: `
We’ve added several new commands and features to make your experience more interactive and fun:

1. **!cefr** - Get detailed information about CEFR language proficiency levels.
2. **!class** - View upcoming classes or events directly from the server.
3. **!ticket** - Open a support ticket to report issues or request assistance from the moderators.
4. **!suggestion** - Submit your suggestions for new features, improvements, or events.
5. **!ddd** - Play the Die Das Der game and challenge yourself on German articles!
                    `,
                    inline: false
                },
                {
                    name: '🎯 Existing Features You Love',
                    value: `
Here’s a reminder of the existing tools and commands that continue to help our community grow:

1. **!leaderboard** - Check the leaderboard and see who’s topping the charts in quizzes and activities.
2. **!resources** - Access curated resources to aid your language learning.
                    `,
                    inline: false
                },
                {
                    name: '🔒 Security & Moderation Enhancements',
                    value: `
We're committed to keeping Frau Lingua a safe and welcoming space. Recent enhancements include:

- **Suspicious Link Protection**: Members who send suspicious links will be automatically removed. Moderators are instantly notified, and the link is deleted.
- **Spam Detection Improvements**: We've enhanced our spam filters to prevent disruption.
- **Offensive Language Monitoring**: The system actively monitors and flags inappropriate language, ensuring a respectful environment.
                    `,
                    inline: false
                },
                {
                    name: '📌 Community Engagement',
                    value: `
- Use **!suggestion** to share ideas that aren't already part of the bot.
- The **Die Das Der (DDD)** game is now live—hone your skills and have fun!
                    `,
                    inline: false
                }
            )
            .setFooter({ text: 'Thank you for being part of the LinguaLounge community! We’re committed to providing the best experience possible.' });

        // Send the embed in the channel
        await message.channel.send({ embeds: [embed] });
    }
};