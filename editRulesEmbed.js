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

        let description = oldEmbed.description;
        if (!description) {
            console.error('❌ Embed has no description text.');
            return;
        }

        // Original rule text and the new one
        const oldRule = '13. Follow Discord Rules.';
        const newRule = '13. Must follow [Discord Guidelines](https://discord.com/guidelines).';

        // Replace rule 13 only
        if (description.includes(oldRule)) {
            description = description.replace(oldRule, newRule);
        } else {
            console.warn('⚠️ Could not find exact Rule 13 text — trying pattern match...');
            description = description.replace(/13\..*$/m, newRule);
        }

        // Build updated embed
        const updatedEmbed = EmbedBuilder.from(oldEmbed).setDescription(description);

        await message.edit({ embeds: [updatedEmbed] });

        console.log('✅ Successfully replaced Rule #13 with clickable Discord Guidelines link!');
    } catch (err) {
        console.error('❌ Error editing embed:', err);
    }
};