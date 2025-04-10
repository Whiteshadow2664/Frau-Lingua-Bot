const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    setTimeout(async () => {
        const userId = '1350188616378351711'; // The ID of the user to ban
        const channelName = 'general';

        try {
            for (const guild of client.guilds.cache.values()) {
                // Ban the user by ID
                await guild.members.ban(userId, {
                    reason: 'Unauthorized promotion of another server',
                });

                const channel = guild.channels.cache.find(
                    ch => ch.name === channelName && ch.isTextBased()
                );

                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#acf508')
                        .setTitle('User Banned')
                        .setDescription(`<@${userId}> has been banned.`)
                        .addFields(
                            { name: 'User ID', value: userId },
                            {
                                name: 'Reason',
                                value:
                                    'You attempted to promote your non-language learning server by misleading members into thinking they would learn German. This behavior is unacceptable. Promoting servers without moderator permission will result in a ban.',
                            }
                        )
                        .setTimestamp();

                    await channel.send({ content: `<@${userId}>`, embeds: [embed] });
                    console.log(`Banned user ${userId} and sent embed.`);
                } else {
                    console.log(`#general not found in ${guild.name}`);
                }
            }
        } catch (err) {
            console.error('Ban failed or user not found:', err.message);
        }
    }, 300000); // 5 minutes
};