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

        // Remove the word “Hindi” from the description
        const newDescription = oldEmbed.description.replace(/,?\s*Hindi/i, '');

        // Rebuild the embed with updated description
        const updatedEmbed = EmbedBuilder.from(oldEmbed).setDescription(newDescription);

        // Edit the message
        await message.edit({ embeds: [updatedEmbed] });

        console.log('✅ Successfully removed “Hindi” and updated the embed!');
    } catch (err) {
        console.error('❌ Error editing embed:', err);
    }
};