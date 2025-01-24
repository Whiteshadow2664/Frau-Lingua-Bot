const { EmbedBuilder } = require('discord.js');

const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#1cd86c',
};

module.exports = {
    name: 'help',
    description: 'Displays quiz rules, Word of the Day feature, and study resources.',
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
                '• The bot will provide links to websites, books, and other learning materials.'
            )
            .setColor(embedColors.default)
            .setFooter({ text: 'Type !quiz to start, or use !resources for study materials. Good luck!' });

        await message.channel.send({ embeds: [embed] });
    },
};