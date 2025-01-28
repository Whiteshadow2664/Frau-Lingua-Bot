const { EmbedBuilder } = require('discord.js');

// A map to store message counts for Moderators
const messageCounts = new Map();

// Function to track messages
function trackMessage(message) {
    if (message.author.bot) return;

    const guild = message.guild;
    const moderatorRole = guild.roles.cache.find((role) => role.name === 'Moderator');

    if (!moderatorRole) return;

    // Check if the user has the "Moderator" role
    if (message.member.roles.cache.has(moderatorRole.id)) {
        const userId = message.author.id;

        // Increment message count
        const userData = messageCounts.get(userId) || { username: message.author.username, count: 0 };
        userData.count += 1;

        messageCounts.set(userId, userData);
    }
}

// Function to generate the leaderboard
function generateLeaderboard(client, channelId) {
    // Sort users by message count in descending order
    const sortedUsers = Array.from(messageCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 users

    const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Moderator Activity Leaderboard (Last 30 Days)')
        .setColor('#FFD700')
        .setDescription(
            sortedUsers
                .map((user, index) => `**${index + 1}. ${user.username}** - ${user.count} points`)
                .join('\n') || 'No messages recorded yet!'
        )
        .setFooter({ text: 'Keep up the great work, Moderators!' });

    const leaderboardChannel = client.channels.cache.get(channelId);
    if (leaderboardChannel) {
        leaderboardChannel.send({ embeds: [leaderboardEmbed] });
    }
}

// Function to reset message counts (to be run periodically)
function resetMessageCounts() {
    messageCounts.clear();
}

module.exports = { trackMessage, generateLeaderboard, resetMessageCounts };