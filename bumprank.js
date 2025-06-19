const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

const DISBOARD_ID = '735147814878969968';
const bumpCache = new Map();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
});

// ✅ Ensure bump_rank table exists
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bump_rank (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                bumps INTEGER NOT NULL DEFAULT 0,
                first_bump_at TIMESTAMP NOT NULL
            );
        `);
    } catch (err) {
        console.error('Error creating bump_rank table:', err);
    }
})();

// ✅ Detect bump messages
module.exports.trackBump = async (message) => {
    try {
        if (
            message.author.id === DISBOARD_ID &&
            message.content.startsWith('Thx for bumping our Server!') &&
            message.mentions.users.size
        ) {
            const user = message.mentions.users.first();
            const userId = user.id;
            const username = user.username;
            const now = new Date();

            if (bumpCache.has(userId)) {
                bumpCache.get(userId).bumps += 1;
            } else {
                bumpCache.set(userId, {
                    username,
                    bumps: 1,
                    first_bump_at: now
                });
            }

            console.log(`✅ Tracked bump by ${username}`);
        }
    } catch (err) {
        console.error('❌ Error tracking bump:', err);
    }
};

// ✅ Cron to save data at 5:15 AM IST
cron.schedule('37 12 * * *', async () => {
    console.log('⏳ Saving bump data to DB...');

    if (bumpCache.size === 0) {
        console.log('✅ No bump data to save.');
        return;
    }

    try {
        const client = await pool.connect();

        for (const [userId, data] of bumpCache.entries()) {
            const { username, bumps, first_bump_at } = data;
            const result = await client.query(`SELECT * FROM bump_rank WHERE user_id = $1`, [userId]);

            if (result.rows.length > 0) {
                await client.query(`UPDATE bump_rank SET bumps = bumps + $1 WHERE user_id = $2`, [bumps, userId]);
            } else {
                await client.query(
                    `INSERT INTO bump_rank (user_id, username, bumps, first_bump_at) VALUES ($1, $2, $3, $4)`,
                    [userId, username, bumps, first_bump_at]
                );
            }
        }

        bumpCache.clear();
        client.release();
        console.log('✅ Bump data saved.');
    } catch (err) {
        console.error('❌ Error saving bump data:', err);
    }
}, { timezone: 'Asia/Kolkata' });

// ✅ !bumps command to show leaderboard
module.exports.execute = async (message) => {
    try {
        const client = await pool.connect();

        const leaderboard = await client.query(`
            SELECT username, bumps,
                EXTRACT(DAY FROM NOW() - first_bump_at) AS days
            FROM bump_rank
            ORDER BY bumps DESC, days ASC
            LIMIT 10
        `);

        client.release();

        if (leaderboard.rows.length === 0) {
            return message.channel.send('No bump activity recorded yet.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🔼 Bump Leaderboard')
            .setColor('#acf508')
            .setDescription(
                leaderboard.rows
                    .map((row, i) =>
                        `**#${i + 1}** | **${row.days} Days** | **${row.username}** - **Bumps:** ${row.bumps}`
                    ).join('\n') +
                `\n\n**Bumps** = Total bumps | **Days** = Since first bump`
            );

        message.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ Error fetching bump leaderboard:', err);
        message.channel.send('An error occurred while retrieving the bump leaderboard.');
    }
};