const { EmbedBuilder } = require('discord.js');
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file
const moment = require('moment-timezone');

// Initialize PostgreSQL client using DATABASE_URL from .env file
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Disable SSL verification for NeonTech (if necessary)
    },
});

client.connect();

// Create the moderator_activity table if it doesn't exist
async function createTableIfNotExist() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS moderator_activity (
            user_id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            points INT DEFAULT 0
        );
    `;
    
    await client.query(createTableQuery);
}

// Call the function to ensure the table exists
createTableIfNotExist().catch(err => console.error('Error creating table:', err));

// Track messages
async function trackMessage(message) {
    if (message.author.bot) return;

    const moderatorRole = message.guild.roles.cache.find((role) => role.name.toLowerCase() === 'moderator');
    if (!moderatorRole || !message.member.roles.cache.has(moderatorRole.id)) return;

    const userId = message.author.id;
    const username = message.author.username;

    // Check if the user exists in the table
    const checkUserQuery = 'SELECT * FROM moderator_activity WHERE user_id = $1';
    const res = await client.query(checkUserQuery, [userId]);

    if (res.rows.length === 0) {
        // User doesn't exist, so insert into the table
        const insertQuery = 'INSERT INTO moderator_activity (user_id, username, points) VALUES ($1, $2, $3)';
        await client.query(insertQuery, [userId, username, 0]);
    } else {
        // Update the user's points
        const updateQuery = 'UPDATE moderator_activity SET points = points + 1 WHERE user_id = $1';
        await client.query(updateQuery, [userId]);
    }
}

// Track "bumping" messages from a specific bot
async function trackBumpingPoints(message) {
    if (
        message.author.id === '735147814878969968' && // Bumping bot ID
        message.content.includes('Thx for bumping our Server! We will remind you in 2 hours!')
    ) {
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            const userId = mentionedUser.id;
            const username = mentionedUser.username;

            // Check if the user exists in the table
            const checkUserQuery = 'SELECT * FROM moderator_activity WHERE user_id = $1';
            const res = await client.query(checkUserQuery, [userId]);

            if (res.rows.length === 0) {
                // User doesn't exist, so insert into the table
                const insertQuery = 'INSERT INTO moderator_activity (user_id, username, points) VALUES ($1, $2, $3)';
                await client.query(insertQuery, [userId, username, 0]);
            } else {
                // Update the user's points
                const updateQuery = 'UPDATE moderator_activity SET points = points + 3 WHERE user_id = $1';
                await client.query(updateQuery, [userId]);
            }
        }
    }
}

// Generate leaderboard
async function generateLeaderboard(client, channelId) {
    const res = await client.query('SELECT * FROM moderator_activity ORDER BY points DESC LIMIT 10');
    const sortedUsers = res.rows;

    const embed = new EmbedBuilder()
        .setTitle('🏆 Moderator of The Month')
        .setColor('#acf508') // Changed color to #acf508
        .setDescription(
            sortedUsers
                .map(
                    (user, index) =>
                        `**${index + 1}. <@${user.user_id}>** - ${user.points} points` // Ping the user in the leaderboard
                )
                .join('\n') || 'No points recorded yet!'
        )
        .setFooter({ text: sortedUsers.length > 0 ? `🎉 Congratulations to ${sortedUsers[0].username} for leading!` : 'Start earning points to get featured!' });

    const channel = client.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
}

// Check if today is the last day of the month and send the leaderboard if true
async function checkLastDayOfMonth(client, channelId) {
    const today = moment().tz('Europe/Berlin');
    const lastDay = moment().endOf('month');

    if (today.isSame(lastDay, 'day')) {
        await generateLeaderboard(client, channelId); // Send leaderboard if today is the last day of the month
    }
}

// Check the last day of the month once every day at midnight
setInterval(() => {
    checkLastDayOfMonth(client, '1224730855717470299'); // Use the provided channel ID
}, 86400000); // 86400000 ms = 24 hours

module.exports = {
    trackMessage,
    trackBumpingPoints,
    generateLeaderboard,
};