const { Client, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000 // Ensures quick reconnection
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
 * Keeps the database connection alive by running a query every 5 minutes.
 */
function keepDBAlive() {
    setInterval(async () => {
        try {
            await pool.query('SELECT 1'); // Simple query to prevent database termination
        } catch (error) {
            console.error('Error keeping DB alive:', error);
        }
    }, 5 * 60 * 1000); // Runs every 5 minutes
}
keepDBAlive(); // Start keep-alive function

/**
 * Handles unexpected database connection errors and reconnects.
 */
pool.on('error', async (err) => {
    console.error('Unexpected DB connection error:', err);
    await pool.end(); // Close the current pool
    pool = new Pool({ 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false },
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    });
    console.log('Reconnected to database.');
});

/**
 * Tracks bump count for a user when a bump message is detected.
 */
async function trackUserBump(message) {
    // Ensure the message is from the bump bot and contains the expected bump message
    if (message.author.id !== BUMP_BOT_ID || !message.content.includes(BUMP_MESSAGE)) return;

    const mentionedUser = message.mentions.users.first(); // Get the first mentioned user
    if (!mentionedUser) return; // If no user is mentioned, exit

    try {
        const client = await pool.connect();
        try {
            // Insert or update the mentioned user in the bump_tracker table
            await client.query(`
                INSERT INTO bump_tracker (user_id, username, bump_count)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    bump_count = bump_tracker.bump_count + 1
            `, [mentionedUser.id, mentionedUser.username]);
        } finally {
            client.release(); // Release connection back to the pool
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
                LIMIT 10
            `);

            if (result.rows.length === 0) {
                return message.channel.send('No bumps recorded yet.');
            }

            let leaderboard = '**Rank - Username - Bumps**\n'; // Removed "Disboard Bumps"
            result.rows.forEach((row, index) => {
                leaderboard += `#${index + 1} - **${row.username}** - ${row.bump_count} bumps\n`;
            });

            leaderboard += '\nKeep bumping to climb the ranks!';

            const embed = new EmbedBuilder()
                .setColor('#acf508')
                .setTitle('📢 DISBOARD BUMPS')
                .setDescription(leaderboard);
                // Removed .setTimestamp()

            message.channel.send({ embeds: [embed] });
        } finally {
            client.release(); // Release connection back to the pool
        }
    } catch (error) {
        console.error('Error fetching bump leaderboard:', error);
        message.channel.send('Error retrieving leaderboard.');
    }
}

module.exports = { trackUserBump, showBumpLeaderboard };