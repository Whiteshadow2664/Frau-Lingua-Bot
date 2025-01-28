const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const messageCounts = {}; // To store the count of messages per moderator

// Function to track messages from moderators
module.exports.trackMessage = (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const hasModeratorRole = message.member.roles.cache.some(role => role.name === 'Moderator');
    if (hasModeratorRole) {
        const userId = message.author.id;

        // If the user is not already tracked, initialize them
        if (!messageCounts[userId]) {
            messageCounts[userId] = { username: message.author.username, points: 0 };
        }

        // Increment the message count for the user
        messageCounts[userId].points += 1;
    }
};

// Function to generate and send the leaderboard
module.exports.sendLeaderboard = async (client) => {
    const channelId = '1333119423711547414'; // Replace with your target channel ID
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
        console.error('Error: Specified channel not found.');
        return;
    }

    // Sort the leaderboard data
    const leaderboard = Object.values(messageCounts)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

    if (leaderboard.length === 0) {
        console.log('No moderators have sent messages yet.');
        return;
    }

    // Build the embed message
    const embed = new EmbedBuilder()
        .setTitle('📊 Moderator Message Leaderboard')
        .setColor('#FF4500')
        .setDescription(
            leaderboard
                .map((entry, index) => `**${index + 1}. ${entry.username}** - ${entry.points} messages`)
                .join('\n')
        );

    // Send the embed to the specified channel
    try {
        await channel.send({ embeds: [embed] });
        console.log('Leaderboard sent successfully.');
    } catch (error) {
        console.error('Error sending leaderboard:', error);
    }
};

// Schedule the leaderboard to be sent daily at 20:21 IST
cron.schedule(
    '39 20 * * *',
    async () => {
        const client = require('../index').client;
        await module.exports.sendLeaderboard(client);
    },
    {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    }
);