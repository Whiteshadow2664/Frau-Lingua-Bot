const { ChannelType, PermissionsBitField } = require('discord.js');
const cron = require('node-cron');

// Replace with your actual voice channel ID
const DATE_CHANNEL_ID = '1385132860972728320';

module.exports = (client) => {
    cron.schedule('00 00 * * *', async () => {
        console.log('🕒 Running date updater at 12:00 AM IST...');

        try {
            const currentDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Kolkata',
            });

            const newName = `📅 ${currentDate}`;
            const channel = await client.channels.fetch(DATE_CHANNEL_ID);

            if (!channel || channel.type !== ChannelType.GuildVoice) {
                console.error('❌ Channel not found or not a voice channel.');
                return;
            }

            if (channel.name !== newName) {
                await channel.setName(newName);
                console.log(`✅ Updated voice channel name to: ${newName}`);
            } else {
                console.log(`ℹ️ Channel already has the correct name: ${newName}`);
            }
        } catch (err) {
            console.error('❌ Error updating date channel:', err);
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
};