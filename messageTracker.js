const { EmbedBuilder } = require('discord.js');

const messageCounts = new Map();

function trackMessage(message) {
    if (message.author.bot) return;

    const moderatorRole = message.guild.roles.cache.find((role) => role.name === 'Moderator');
    if (!moderatorRole || !message.member.roles.cache.has(moderatorRole.id)) return;

    const userId = message.author.id;
    const userData = messageCounts.get(userId) || { username: message.author.username, count: 0 };
    userData.count += 1;

    messageCounts.set(userId, userData);
}

function generateLeaderboard(client, channelId) {
    const sortedUsers = Array.from(messageCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Moderator Activity Leaderboard (Last 30 Days)')
        .setColor('#FFD700')
        .setDescription(
            sortedUsers
                .map((user, index) => `**${index + 1}. ${user.username}** - ${user.count} messages`)
                .join('\n') || 'No messages recorded yet!'
        )
        .setFooter({ text: 'Keep it up, Moderators!' });

    const leaderboardChannel = client.channels.cache.get(channelId);
    if (leaderboardChannel) {
        leaderboardChannel.send({ embeds: [leaderboardEmbed] });
    }
}

function resetMessageCounts() {
    messageCounts.clear();
}

module.exports = { trackMessage, generateLeaderboard, resetMessageCounts };