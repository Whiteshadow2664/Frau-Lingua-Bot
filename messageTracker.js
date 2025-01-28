const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const messageCounts = {};

// Function to track messages and count points for moderators
module.exports.trackMessage = (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const hasModeratorRole = message.member.roles.cache.some(role => role.name === 'Moderator');
    if (hasModeratorRole) {
        const userId = message.author.id;

        if (!messageCounts[userId]) {
            messageCounts[userId] = { username: message.author.username, points: 0 };
        }

        messageCounts[userId].points += 1; // Increment points for the user
    }
};

// Function to generate and send the leaderboard
module.exports.sendLeaderboard = async (client) => {
    const channelId = '1333119423711547414'; // Replace with your channel ID
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
        console.error('Could not find the specified channel.');
        return;
    }

    // Sort members by points in descending order
    const leaderboard = Object.values(messageCounts)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

    if (leaderboard.length === 0) {
        console.log('No messages to display in the leaderboard.');
        return;
    }

    // Create an embed for the leaderboard
    const embed = new EmbedBuilder()
        .setTitle('Message Leaderboard (Top 10 Moderators)')
        .setColor('#FF00FF')
        .setDescription(
            leaderboard.map((entry, index) =>
                `**${index + 1}. ${entry.username}** - ${entry.points} messages`
            ).join('\n')
        );

    // Send the leaderboard to the channel
    try {
        await channel.send({ embeds: [embed] });
        console.log('Leaderboard sent successfully!');
    } catch (error) {
        console.error('Error sending leaderboard:', error);
    }
};

// Schedule the leaderboard to be sent daily at 20:21 IST
cron.schedule(
    '21 20 * * *', // At 20:21 IST
    async () => {
        const client = require('../index').client;
        await module.exports.sendLeaderboard(client);
    },
    {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    }
);