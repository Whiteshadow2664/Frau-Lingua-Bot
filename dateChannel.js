const { ChannelType } = require('discord.js');
const cron = require('node-cron');

module.exports = async (client) => {
    const CHANNEL_NAME_PREFIX = '📅 Date:'; // Prefix used to identify the channel

    // Runs daily at 11:21 AM IST
    cron.schedule('21 5 * * *', async () => {
        try {
            const currentDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Kolkata',
            });

            const dateChannelName = `${CHANNEL_NAME_PREFIX} ${currentDate}`;

            client.guilds.cache.forEach(async (guild) => {
                // Fetch updated channel cache
                await guild.channels.fetch();

                const existingChannel = guild.channels.cache.find(
                    ch =>
                        ch.type === ChannelType.GuildVoice &&
                        ch.name.startsWith(CHANNEL_NAME_PREFIX)
                );

                if (existingChannel) {
                    if (existingChannel.name !== dateChannelName) {
                        await existingChannel.setName(dateChannelName);
                        console.log(`[✅] Updated channel name in ${guild.name} to "${dateChannelName}"`);
                    }
                } else {
                    console.warn(`[⚠️] No date channel found in ${guild.name}. Please create one starting with "${CHANNEL_NAME_PREFIX}".`);
                }
            });
        } catch (err) {
            console.error('[❌] Failed to update date channel:', err);
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
};