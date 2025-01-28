const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

const messageCounts = new Map();
const dataFile = './messageCounts.json';

// Load saved message counts
function loadMessageCounts() {
    if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        data.forEach(([userId, userData]) => messageCounts.set(userId, userData));
    }
}

// Save message counts
function saveMessageCounts() {
    fs.writeFileSync(dataFile, JSON.stringify(Array.from(messageCounts.entries())));
}

// Track messages
function trackMessage(message) {
    if (message.author.bot) return;

    const moderatorRole = message.guild.roles.cache.find((role) => role.name.toLowerCase() === 'moderator');
    if (!moderatorRole || !message.member.roles.cache.has(moderatorRole.id)) return;

    const userId = message.author.id;
    // Initialize or update user data with points
    const userData = messageCounts.get(userId) || { id: userId, username: message.author.username, points: 0 };
    userData.points++; // Increment points for each message
    messageCounts.set(userId, userData);

    saveMessageCounts(); // Ensure we save the data after each message
}

// Track "bumping" messages from a specific bot
function trackBumpingPoints(message) {
    if (
        message.author.id === '735147814878969968' && // Bumping bot ID
        message.content.includes('Thx for bumping our Server! We will remind you in 2 hours!')
    ) {
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            const userId = mentionedUser.id;
            // Initialize or update user data with points
            const userData = messageCounts.get(userId) || { id: userId, username: mentionedUser.username, points: 0 };
            userData.points += 3; // Add 3 points for bumping
            messageCounts.set(userId, userData);

            saveMessageCounts(); // Ensure we save the data after each bump
        }
    }
}

// Generate leaderboard
function generateLeaderboard(client, channelId) {
    const sortedUsers = Array.from(messageCounts.values())
        .sort((a, b) => b.points - a.points) // Sort users by points in descending order
        .slice(0, 10); // Take top 10 users

    const embed = new EmbedBuilder()
        .setTitle('🏆 Moderator Activity Leaderboard (Last 30 Days)')
        .setColor('#FFD700')
        .setDescription(
            sortedUsers
                .map(
                    (user, index) =>
                        `**${index + 1}. <@${user.id}>** - ${user.points} points` // Ping the user in the leaderboard
                )
                .join('\n') || 'No points recorded yet!'
        )
        .setFooter({ text: sortedUsers.length > 0 ? `🎉 Congratulations to ${sortedUsers[0].username} for leading!` : 'Start earning points to get featured!' });

    const channel = client.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
}

// Reset message counts
function resetMessageCounts() {
    messageCounts.clear();
    saveMessageCounts();
}

loadMessageCounts();

module.exports = {
    trackMessage,
    trackBumpingPoints,
    generateLeaderboard,
    resetMessageCounts,
    saveMessageCounts,
    loadMessageCounts,
};