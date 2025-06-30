// mediaBlocker.js
const { Events } = require('discord.js');
const MEDIA_BLOCK_ROLE_ID = '1389103774215180368';

module.exports = {
    monitorMedia: (client) => {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            const member = message.member;
            if (!member || !member.roles.cache.has(MEDIA_BLOCK_ROLE_ID)) return;

            const hasMedia = message.attachments.size > 0 || message.embeds.some(embed => embed.image || embed.video);
            if (hasMedia) {
                try {
                    await message.delete();
                } catch (err) {
                    console.error('❌ Failed to delete media message:', err.message);
                }

                try {
                    const warnMsg = await message.channel.send(`🚫 <@${message.author.id}> you're not allowed to send media.`);
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000); // delete after 5s
                } catch (err) {
                    console.error('❌ Failed to send/delete media warning:', err.message);
                }
            }
        });
    }
};