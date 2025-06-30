// mediaBlocker.js
const { Events } = require('discord.js');

// Replace with your actual role ID (users WITH this role can't send media)
const MEDIA_BLOCK_ROLE_ID = '1389104809910472744';

module.exports = {
    monitorMedia: (client) => {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            const member = message.member;
            if (!member || !member.roles.cache.has(MEDIA_BLOCK_ROLE_ID)) return;

            const hasMedia = message.attachments.size > 0 || message.embeds.some(embed => embed.image || embed.video);
            if (hasMedia) {
                await message.delete().catch(console.error);
                message.channel.send(`🚫 <@${message.author.id}> you're not allowed to send media.`)
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        });
    }
};