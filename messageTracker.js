const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// Store the message count for each member with the Moderator role
const messageCounts = {};

// The time window for counting messages (30 days)
const MESSAGE_TIME_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Function to track messages and count points for moderators
module.exports.trackMessage = (message) => {
    if (message.author.bot) return;

    // Check if the member has the 'Moderator' role
    const hasModeratorRole = message.member.roles.cache.some(role => role.name === 'Moderator');
    if (hasModeratorRole) {
        const userId = message.author.id;
        const timestamp = message.createdTimestamp;

        // Initialize user data if it's the first time
        if (!messageCounts[userId]) {
            messageCounts[userId] = {
                username: message.author.username,
                points: 0,
                messages: [] // Store the timestamps of each message
            };
        }

        // Filter out messages older than 30 days
        messageCounts[userId].messages = messageCounts[userId].messages.filter(msgTime => timestamp - msgTime <= MESSAGE_TIME_WINDOW);

        // Add the new message timestamp to the list
        messageCounts[userId].messages.push(timestamp);

        // Update the points based on the count of messages within the time window
        messageCounts[userId].points = messageCounts[userId].messages.length;
    }
};

// Function to generate and send the leaderboard
module.exports.sendLeaderboard = async (client) => {
    // Sort members by points in descending order
    const leaderboard = Object.values(messageCounts)
        .sort((a, b) => b.points - a.points)
        .slice(0, 10); // Get top 10 members

    // Create an embed for the leaderboard
    const embed = new EmbedBuilder()
        .setTitle('Message Leaderboard (Top 10 Moderators in the Last 30 Days)')
        .setColor('#FF00FF')
        .setDescription(leaderboard.map((entry, index) => 
            `**${index + 1}. ${entry.username}** - ${entry.points} messages`
        ).join('\n'));

    // Send the leaderboard to the channel with the given ID
    const channel = await client.channels.fetch('1333119423711547414');
    if (channel) {
        await channel.send({ embeds: [embed] });
    } else {
        console.error('Could not find the specified channel.');
    }
};

// Schedule the leaderboard to be sent daily at 19:50 IST
cron.schedule('00 20 * * *', async () => {
    const client = require('../index').client;  // Assuming client is exported from your index.js
    await module.exports.sendLeaderboard(client);
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata', // Set timezone to your desired region (IST)
});