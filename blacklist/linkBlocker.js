// linkBlocker.js
const { Events } = require('discord.js');
const LINK_BLOCK_ROLE_ID = '1389103629964804267';
const LINK_REGEX = /(https?:\/\/[^\s]+)/i;

module.exports = {
    monitorLinks: (client) => {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            const member = message.member;
            if (!member || !member.roles.cache.has(LINK_BLOCK_ROLE_ID)) return;

            if (LINK_REGEX.test(message.content)) {
                try {
                    await message.delete();
                } catch (err) {
                    console.error('❌ Failed to delete link message:', err.message);
                }

                try {
                    const warnMsg = await message.channel.send(` <@${message.author.id}> you're not allowed to send links.`);
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000); // safer timeout
                } catch (err) {
                    console.error('❌ Failed to send/delete warning message:', err.message);
                }
            }
        });
    }
};