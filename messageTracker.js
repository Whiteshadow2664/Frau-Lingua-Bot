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
    const userData = messageCounts.get(userId) || { username: message.author.username, count: 0 };
    userData.count++;
    messageCounts.set(userId, userData);
}

// Generate leaderboard
function generateLeaderboard(client, channelId) {
    const sortedUsers = Array.from(messageCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle('🏆 Moderator Activity Leaderboard (Last 30 Days)')
        .setColor('#FFD700')
        .setDescription(
            sortedUsers
                .map((user, index) => `**${index + 1}. ${user.username}** - ${user.count} messages`)
                .join('\n') || 'No messages recorded yet!'
        )
        .setFooter({ text: 'Keep it up, Moderators!' });

    const channel = client.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
}

// Reset message counts
function resetMessageCounts() {
    messageCounts.clear();
    saveMessageCounts();
}

loadMessageCounts();

module.exports = { trackMessage, generateLeaderboard, resetMessageCounts, saveMessageCounts, loadMessageCounts };