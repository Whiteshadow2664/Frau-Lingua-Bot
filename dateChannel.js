const { ChannelType, PermissionsBitField } = require('discord.js');
const cron = require('node-cron');

module.exports = (client) => {
    const CHANNEL_NAME_PREFIX = '📅 Date:'; // You can customize this

    cron.schedule('59 5 * * *', async () => {
        const guilds = client.guilds.cache;

        for (const [guildId, guild] of guilds) {
            try {
                const currentDate = new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                });

                const dateChannelName = `${CHANNEL_NAME_PREFIX} ${currentDate}`;

                await guild.channels.fetch(); // Ensure channels are fetched
                let dateChannel = guild.channels.cache.find(
                    ch =>
                        ch.type === ChannelType.GuildVoice &&
                        ch.name.startsWith(CHANNEL_NAME_PREFIX)
                );

                if (!dateChannel) {
                    // Create the voice channel if not found
                    await guild.channels.create({
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
                    console.log(`[+] Created new date channel in ${guild.name}`);
                } else if (dateChannel.name !== dateChannelName) {
                    await dateChannel.setName(dateChannelName);
                    console.log(`[~] Updated date channel in ${guild.name} to ${dateChannelName}`);
                }
            } catch (err) {
                console.error(`Error updating/creating date channel in ${guild.name}:`, err);
            }
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
};