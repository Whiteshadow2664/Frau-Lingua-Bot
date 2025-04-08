const { EmbedBuilder } = require('discord.js');

const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#acf508',
};

module.exports = {
    name: 'help',
    description: 'Displays quiz rules, Word of the Day feature, study resources, and other server commands.',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription(
                '**1. Quiz Rules**\n' +
                '• Use **!quiz** to start the quiz.\n' +
                '• Select a language by reacting to the flag: 🇩🇪 (German), 🇫🇷 (French), 🇷🇺 (Russian).\n' +
                '• Choose the level of the quiz by reacting to A1, A2, etc.\n' +
                '• The bot will ask **5 questions** with a time limit of **1 minute** for each.\n' +
                '• At the end, the bot provides a **detailed result** to help you improve.\n' +
                '• Users who score **5 out of 5** will receive **1 extra point**.\n' +
                '• In case of a tie (same score), the user with the higher **average score** across quizzes will rank higher.\n\n' +

                '**2. Word of the Day**\n' +
                '• The bot sends a new word daily in the respective language channels:\n' +
                `   - **German**: Sent at <t:1737673200:t> (according to your time zone)\n` +
                `   - **French**: Sent at <t:1737673200:t> (according to your time zone)\n` +
                `   - **Russian**: Sent at <t:1737669600:t> (according to your time zone)\n\n` +

                '**3. Study Resources**\n' +
                '• Use the command **!resources** to get helpful study resources for Russian, German, and French.\n' +
                '• The bot will provide links to websites, books, and other learning materials.\n\n' +

                '**4. Suggestions**\n' +
                '• Use **!suggestion** to submit an idea or suggestion for the server.\n' +
                '• The moderators will review your suggestion and take appropriate action.\n\n' +

                '**5. Reporting Issues**\n' +
                '• Use **!ticket** to report an issue or someone on the server.\n' +
                '• Provide a brief description, and the moderators will handle your report promptly.\n\n' +

                '**6. Leaderboard**\n' +
                '• Use **!leaderboard** to view the leaderboard for a specific language and level.\n' +
                '• The leaderboard ranks users based on their quiz scores, with bonus point for scoring 5 out of 5.\n' +
                '• In case of a tie in scores, users are ranked by their **average quiz score**.\n\n' +

                '**7. Full Command Guide**\n' +
                'Here is a categorized list of available commands. Use them in the appropriate channels as needed.'
            )
            .setColor(embedColors.default)
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '🔹 General Commands', 
                    value: 
                        '`!help` — Get assistance with the bot\n' +
                        '`!resources` — Access learning materials\n' +
                        '`!ddd` — Play the Die Der Das game *(use in <#quiz-bot>)*\n' +
                        '`!quiz` — Start a vocabulary quiz *(use in <#quiz-bot>)*\n' +
                        '`!updates` — View recent bot updates\n' +
                        '`!leaderboard` — Display the quiz leaderboard\n' +
                        '`!modrank` — View moderator rankings\n' +
                        '`!tips` — Receive study tips\n' +
                        '`!class` — Check upcoming events and classes\n' +
                        '`!exam` — Get information on German proficiency exams\n' +
                        '`!joke` — Get a random joke',
                    inline: false 
                },
                { 
                    name: '🛠️ Moderator Commands', 
                    value: 
                        '`!purge` — Clear a specified number of messages\n' +
                        '`!announcement` — Send a server-wide announcement\n' +
                        '`!ws` — Provide a worksheet for users to complete\n' +
                        '`!ban @username` — Ban a user from the server\n' +
                        '`!kick @username` — Remove a user from the server\n' +
                        '`!mute @username` — Temporarily mute a user',
                    inline: false 
                }
            )
            .setFooter({ text: 'Please feel free to contact a Moderator if you have any issues. Good luck!' });

        await message.channel.send({ embeds: [embed] });
    },
};