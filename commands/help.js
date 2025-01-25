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
                '• At the end, the bot provides a **detailed result** to help you improve.\n\n' +

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
                '• Provide a brief description, and the moderators will handle your report promptly.'
            )
            .setColor(embedColors.default)
            .setFooter({ text: 'Type !quiz to start, or use !resources, !suggestion, or !ticket for other features. Good luck!' });

        await message.channel.send({ embeds: [embed] });
    },
};