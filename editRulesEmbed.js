const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID = '1410887257635688528';
const MESSAGE_ID = '1410902166163558433';

let hasEdited = false;

module.exports = async (client) => {
    if (hasEdited) return;
    hasEdited = true;

    try {
        console.log('🔍 Fetching message to update embed...');

        const channel = await client.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(MESSAGE_ID);

        const oldEmbed = message.embeds[0];
        if (!oldEmbed) {
            console.error('❌ No embed found in that message.');
            return;
        }

        // Clone the embed into a mutable structure
        let description = oldEmbed.description;

        if (!description) {
            console.error('❌ Embed has no description text.');
            return;
        }

        // Identify the specific Rule 7 text
        const oldRule =
            '7. Please keep the server to English, German, French, Russian or Hindi. If you can’t keep to metioned languages, you will be kicked.';
        const newRule =
            '7. Please keep the server to English, German, French or Russian. If you can’t keep to metioned languages, you will be kicked.';

        // Replace that line (keep rest identical)
        if (description.includes(oldRule)) {
            description = description.replace(oldRule, newRule);
        } else {
            console.warn('⚠️ Could not find exact Rule 7 text — trying pattern match...');
            description = description.replace(/7\..*?(?=\n8\.)/s, `${newRule}\n`);
        }

        const updatedEmbed = EmbedBuilder.from(oldEmbed).setDescription(description);

        await message.edit({ embeds: [updatedEmbed] });

        console.log('✅ Successfully replaced Rule #7 text.');
    } catch (err) {
        console.error('❌ Error editing embed:', err);
    }
};