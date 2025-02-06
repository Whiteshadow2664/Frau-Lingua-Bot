const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

// Connect to PostgreSQL with optimized settings
let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,  // Close idle connections after 30s
    connectionTimeoutMillis: 5000  // Ensures quick reconnection
});

// Keep Database Connection Alive
function keepDBAlive() {
    setInterval(async () => {
        try {
            await pool.query('SELECT 1'); // Simple query to prevent Neon from terminating the connection
        } catch (error) {
            console.error('❌ Error keeping DB alive:', error);
        }
    }, 5 * 60 * 1000); // Runs every 5 minutes
}
keepDBAlive();

// Auto-Reconnect on Database Errors
pool.on('error', async (err) => {
    console.error('❌ Unexpected DB connection error:', err);
    await pool.end();  // Close the current pool
    pool = new Pool({ 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false },
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    });
    console.log('✅ Reconnected to the database.');
});

// Create `bump_tracker` table if not exists
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bump_tracker (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                bumps INT DEFAULT 0
            );
        `);
    } catch (err) {
        console.error('❌ Error creating bump_tracker table:', err);
    }
};

// Track Bumps
const trackBump = async (message) => {
    if (
        message.author.id === '735147814878969968' && // Disboard Bot ID
        message.content.includes('Thx for bumping our Server!')
    ) {
        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) return;

        try {
            const client = await pool.connect();
            try {
                await client.query(
                    `INSERT INTO bump_tracker (user_id, username, bumps) 
                     VALUES ($1, $2, 1) 
                     ON CONFLICT (user_id) 
                     DO UPDATE SET bumps = bump_tracker.bumps + 1, username = EXCLUDED.username;`,
                    [mentionedUser.id, mentionedUser.username]
                );
            } finally {
                client.release(); // Release connection back to the pool
            }
        } catch (err) {
            console.error('❌ Error tracking bump:', err);
        }
    }
};

// Show Leaderboard
const showBumpLeaderboard = async (message) => {
    try {
        const client = await pool.connect();
        try {
            const { rows } = await client.query(`
                SELECT username, bumps 
                FROM bump_tracker 
                ORDER BY bumps DESC 
                LIMIT 10;
            `);

            if (rows.length === 0) {
                return message.channel.send('No bumps have been recorded yet!');
            }

            const leaderboard = rows
                .map((user, index) => `#${index + 1} - **${user.username}** - ${user.bumps} bumps`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Disboard Bumps')
                .setColor('#acf508')
                .setDescription(`**Rank - Username - Bumps**\n${leaderboard}`)
                .setFooter({ text: 'Keep bumping to climb the ranks!' });

            message.channel.send({ embeds: [embed] });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Error fetching bump leaderboard:', err);
        message.channel.send('An error occurred while fetching the leaderboard.');
    }
};

// Initialize Table
createTable();

module.exports = {
    trackBump,
    showBumpLeaderboard
};
