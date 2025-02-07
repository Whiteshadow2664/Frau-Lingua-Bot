const { Client, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

// Ensure the table exists
async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bump_tracker (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                bump_count INT DEFAULT 0
            );
        `);
        console.log('✅ bump_tracker table checked/created.');
    } catch (error) {
        console.error('❌ Error creating bump_tracker table:', error);
    }
}
createTable();

const BUMP_BOT_ID = '735147814878969968';
const BUMP_MESSAGE = 'Thx for bumping our Server! We will remind you in 2 hours!';

/**
 * Tracks bump count for a user when a bump message is detected.
 */
async function trackUserBump(message) {
    if (message.author.id !== BUMP_BOT_ID || !message.content.startsWith(BUMP_MESSAGE)) return;

    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) return;

    try {
        const client = await pool.connect();
        try {
            await client.query(`
                INSERT INTO bump_tracker (user_id, username, bump_count)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    bump_count = bump_tracker.bump_count + 1
            `, [mentionedUser.id, mentionedUser.username]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error tracking user bump:', error);
    }
}

/**
 * Displays the bump leaderboard.
 */
async function showBumpLeaderboard(message) {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT username, bump_count FROM bump_tracker
                WHERE bump_count > 0 
                ORDER BY bump_count DESC
            `);

            if (result.rows.length === 0) {
                return message.channel.send('No bumps recorded yet.');
            }

            let leaderboard = '**Bump Leaderboard**\n';
            result.rows.forEach((row, index) => {
                leaderboard += `**#${index + 1}** | **${row.username}** - **Bumps:** ${row.bump_count}\n`;
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff99')
                .setTitle('Bump Leaderboard')
                .setDescription(leaderboard)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching bump leaderboard:', error);
        message.channel.send('Error retrieving leaderboard.');
    }
}

module.exports = { trackUserBump, showBumpLeaderboard };