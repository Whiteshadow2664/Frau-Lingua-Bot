const { EmbedBuilder } = require('discord.js');

const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#1cd86c', // Default color for the embed
};

module.exports = {
    name: 'resources',
    description: 'Shares helpful resources for learning languages.',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('Language Learning Resources')
            .setDescription(
                '**Russian**:\n' +
                '1. **YouTube**: [Real Russian Club](https://youtube.com/@realrussianclub?si=EBfp-OaeKlbDPvGM)\n' +
                '2. **Books**: Recommended beginner/intermediate book.\n' +
                '3. **Vocabulary PDF**: [Download](https://drive.google.com/file/d/1I9i72NHcSHIrBEHdxMH3vGkwZVnVcGZ5/view?usp=drivesdk)\n\n' +
                '**German**:\n' +
                '1. **YouTube**: [Learn German Original](https://youtube.com/@learngermanoriginal?si=r_THc9xCajUCafmd)\n' +
                '2. **Books**: Recommended beginner/intermediate book.\n' +
                '3. **Vocabulary PDF**: [Download](https://drive.google.com/file/d/1I73hvUDb3uvVNP98oAEbOvVYGLv1NlKO/view?usp=drivesdk)\n\n' +
                '**French**:\n' +
                '1. **YouTube**: [Lingoni French](https://youtube.com/@lingonifrench?si=WHIrGNAYd9fNwzOS)\n' +
                '2. **Books**: Recommended beginner/intermediate book.\n' +
                '3. **Vocabulary PDF**: [Download](https://drive.google.com/file/d/1I4p26ddR2Wy_XsB2dtX_5uwvsjYq69So/view?usp=drivesdk)\n\n' +
                '**Other Helpful Videos**:\n' +
                '1. [Watch Now](https://youtu.be/4-eDoThe6qo?si=IdydKencCJuDj9aY)\n' +
                '2. [Watch Now](https://youtu.be/j9n3Bc7Nkqs?si=pWKbaKJclcB9G2Xd)'
            )
            .setColor(embedColors.default)
            .setFooter({ text: 'Explore these resources to enhance your learning!' });

        await message.channel.send({ embeds: [embed] });
    },
};