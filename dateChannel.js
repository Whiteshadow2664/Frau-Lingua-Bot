const { ChannelType, PermissionsBitField } = require('discord.js');
const cron = require('node-cron');

module.exports = async (client) => {
    const CHANNEL_NAME_PREFIX = '📅 Date:'; // You can customize this

    // Runs daily at 00:00 AM IST
    cron.schedule('0 0 * * *', async () => {
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'Asia/Kolkata',
        });

        const dateChannelName = `${CHANNEL_NAME_PREFIX} ${currentDate}`;

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await guild.fetch(); // Ensure fresh data

                // Check if a date voice channel already exists
                let dateChannel = guild.channels.cache.find(
                    ch => ch.type === ChannelType.GuildVoice && ch.name.startsWith(CHANNEL_NAME_PREFIX)
                );

                if (!dateChannel) {
                    // Create the channel if not found
                    dateChannel = await guild.channels.create({
                        name: dateChannelName,
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.Connect],
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            },
                        ],
                    });
                } else if (dateChannel.name !== dateChannelName) {
                    // Update name if outdated
                    await dateChannel.setName(dateChannelName);
                }

                console.log(`[✅] Updated date channel in ${guild.name}: ${dateChannelName}`);
            } catch (err) {
                console.error(`[❌] Failed to update date channel in guild ${guildId}:`, err);
            }
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
};