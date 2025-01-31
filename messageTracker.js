const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Create a single database connection pool with proper handling
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for NeonTech
    },
    max: 10, // Limit pool size to avoid too many connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Wait max 5s for a connection
});

// Function to execute queries safely with automatic reconnection
async function executeQuery(query, params = []) {
    let client;
    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(query, params);
        return result;
    } catch (err) {
        console.error('❌ Database error:', err);
        return null;
    } finally {
        if (client) client.release(); // Always release client back to pool
    }
}

// Function to create the moderator_activity table if it doesn't exist
async function createTableIfNotExist() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS moderator_activity (
            user_id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            points INT DEFAULT 0
        );
    `;
    await executeQuery(createTableQuery);
}

// Ensure the table exists on startup
createTableIfNotExist();

// Track messages from moderators
async function trackMessage(message) {
    if (message.author.bot) return;

    const moderatorRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'moderator');
    if (!moderatorRole || !message.member.roles.cache.has(moderatorRole.id)) return;

    const userId = message.author.id;
    const username = message.author.username;

    try {
        const res = await executeQuery('SELECT * FROM moderator_activity WHERE user_id = $1', [userId]);

        if (res && res.rows.length === 0) {
            await executeQuery('INSERT INTO moderator_activity (user_id, username, points) VALUES ($1, $2, $3)', [userId, username, 1]);
        } else {
            await executeQuery('UPDATE moderator_activity SET points = points + 1 WHERE user_id = $1', [userId]);
        }
    } catch (err) {
        console.error('❌ Error tracking message:', err);
    }
}

// Track bumping messages from a specific bot
async function trackBumpingPoints(message) {
    if (
        message.author.id === '735147814878969968' && // Bumping bot ID
        message.content.includes('Thx for bumping our Server!')
    ) {
        console.log(`✅ Bump detected: ${message.content}`);

        let mentionedUser = message.mentions.users.first();

        if (!mentionedUser) {
            console.log('⚠ No user mentioned in bump message. Checking manually...');
            const userIdMatch = message.content.match(/<@!?(\d+)>/);
            if (userIdMatch) {
                mentionedUser = await message.client.users.fetch(userIdMatch[1]);
            }
        }

        if (mentionedUser) {
            const userId = mentionedUser.id;
            const username = mentionedUser.username;

            console.log(`✅ Bump credited to: ${username} (${userId})`);

            try {
                const res = await executeQuery('SELECT * FROM moderator_activity WHERE user_id = $1', [userId]);

                if (res && res.rows.length === 0) {
                    await executeQuery('INSERT INTO moderator_activity (user_id, username, points) VALUES ($1, $2, $3)', [userId, username, 3]);
                } else {
                    await executeQuery('UPDATE moderator_activity SET points = points + 3 WHERE user_id = $1', [userId]);
                }
            } catch (err) {
                console.error('❌ Error tracking bumping points:', err);
            }
        } else {
            console.log('❌ No valid user found for bumping message.');
        }
    }
}

// Generate and display the moderator leaderboard
async function generateLeaderboard(discordClient, channelId) {
    try {
        const res = await executeQuery('SELECT * FROM moderator_activity ORDER BY points DESC LIMIT 10');

        if (!res) return;

        const sortedUsers = res.rows;

        const embed = new EmbedBuilder()
            .setTitle('MODERATOR LEADERBOARD')
            .setColor('#acf508')
            .setDescription(
                sortedUsers
                    .map(
                        (user, index) =>
                            `**${index + 1}. <@${user.user_id}>** - ${user.points} points`
                    )
                    .join('\n') || 'No points recorded yet!'
            )
            .setFooter({ text: sortedUsers.length > 0 ? `🎉 Congratulations to ${sortedUsers[0].username} for leading!` : 'Start earning points to get featured!' });

        const channel = discordClient.channels.cache.get(channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error('❌ Error generating leaderboard:', err);
    }
}

// Export the functions for use in other parts of the bot
module.exports = {
    trackMessage,
    trackBumpingPoints,
    generateLeaderboard,
};