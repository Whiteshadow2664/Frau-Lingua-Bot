// linkBlocker.js
const { Events } = require('discord.js');

// Replace with your actual role ID (users WITH this role can't send links)
const LINK_BLOCK_ROLE_ID = '1389103629964804267';

const LINK_REGEX = /(https?:\/\/[^\s]+)/i;

module.exports = {
    monitorLinks: (client) => {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;

            const member = message.member;
            if (!member || !member.roles.cache.has(LINK_BLOCK_ROLE_ID)) return;

            if (LINK_REGEX.test(message.content)) {
                await message.delete().catch(console.error);
                message.channel.send(` <@${message.author.id}> you're not allowed to send links.`)
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 300000));
            }
        });
    }
};
