const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const messageCounts = {};
const MESSAGE_TIME_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Function to track messages and count points for moderators
module.exports.trackMessage = (message) => {
    if (message.author.bot) return;

    const hasModeratorRole = message.member.roles.cache.some(role => role.name === 'Moderator');
    if (hasModeratorRole) {
        const userId = message.author.id;
        const timestamp = message.createdTimestamp;

        if (!messageCounts[userId]) {
            messageCounts[userId] = { username: message.author.username, points: 0, messages: [] };
        }

        messageCounts[userId].messages.push(timestamp);
        messageCounts[userId].points = messageCounts[userId].messages.length;
    }
};

// Function to generate and send the leaderboard, now includes reading history
module.exports.sendLeaderboard = async (client) => {
    const channel = await client.channels.fetch('1333119423711547414'); // The channel ID

    if (!channel) {
        console.error('Could not find the specified channel.');
        return;
    }

    // Fetch messages from the last 30 days
    let messages = [];
    try {
        messages = await channel.messages.fetch({
            limit: 100, // Fetch up to 100 messages at once (adjust as necessary)
            before: Date.now() - MESSAGE_TIME_WINDOW, // Only fetch messages from the last 30 days
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return;
    }

    // Process the messages to count them
    messages.forEach((message) => {
        module.exports.trackMessage(message);
    });

    // Sort members by points in descending order
    const leaderboard = Object.values(messageCounts)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

    // Create an embed for the leaderboard
    const embed = new EmbedBuilder()
        .setTitle('Message Leaderboard (Top 10 Moderators in the Last 30 Days)')
        .setColor('#FF00FF')
        .setDescription(
            leaderboard.map((entry, index) => 
                `**${index + 1}. ${entry.username}** - ${entry.points} messages`
            ).join('\n')
        );

    // Send the leaderboard to the channel
    await channel.send({ embeds: [embed] });
};

// Schedule the leaderboard to be sent daily at 20:01 IST
cron.schedule('08 20 * * *', async () => {
    const client = require('../index').client;
    await module.exports.sendLeaderboard(client);
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
});