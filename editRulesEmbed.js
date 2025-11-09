const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID = '1410887257635688528';
const MESSAGE_ID = '1410902166163558433';

let hasEdited = false; // prevents re-editing every restart

module.exports = async (client) => {
    if (hasEdited) return; // safety check
    hasEdited = true;

    try {
        console.log('🔍 Fetching message to update embed...');

        const channel = await client.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(MESSAGE_ID);

        const oldEmbed = message.embeds[0];
        if (!oldEmbed) return console.error('❌ No embed found in that message.');

        // Copy the existing description
        let description = oldEmbed.description;

        // Replace only Rule 7 line (keeping rest identical)
        description = description.replace(
            /7\..*?(?=\n8\.)/,
            '7. Please keep the server to English, German, French or Russian. If you can’t keep to mentioned languages, you will be kicked.\n'
        );

        // Build updated embed
        const updatedEmbed = EmbedBuilder.from(oldEmbed).setDescription(description);

        // Edit the original message with updated embed
        await message.edit({ embeds: [updatedEmbed] });

        console.log('✅ Successfully updated Rule #7 while keeping the rest unchanged!');
    } catch (err) {
        console.error('❌ Error editing embed:', err);
    }
};