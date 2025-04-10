const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

const boostCache = new Map();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
});

// ✅ Ensure table exists
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS boost_rank (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                boosts INTEGER NOT NULL DEFAULT 0,
                first_boost_at TIMESTAMP NOT NULL
            );
        `);
    } catch (err) {
        console.error('Error creating boost_rank table:', err);
    }
})();

// ✅ Track boost messages
module.exports.trackBoost = async (message) => {
    if (
        !message.system &&
        message.author.bot &&
        message.content.includes('just Boosted the server!')
    ) {
        const match = message.content.match(/<@!?(\d+)>/);
        if (!match) return;

        const userId = match[1];
        const user = await message.guild.members.fetch(userId).catch(() => null);
        if (!user) return;

        const username = user.user.username;
        const now = new Date();

        if (boostCache.has(userId)) {
            boostCache.get(userId).boosts += 1;
        } else {
            boostCache.set(userId, { username, boosts: 1, first_boost_at: now });
        }
    }
};

// ✅ Cron job to save boost data daily at 5:10 AM IST
cron.schedule('10 5 * * *', async () => {
    console.log('⏳ Saving boost data to DB...');

    if (boostCache.size === 0) {
        console.log('✅ No boost data to save.');
        return;
    }

    try {
        const client = await pool.connect();

        for (const [userId, data] of boostCache.entries()) {
            const { username, boosts, first_boost_at } = data;
            const result = await client.query(`SELECT * FROM boost_rank WHERE user_id = $1`, [userId]);

            if (result.rows.length > 0) {
                await client.query(
                    `UPDATE boost_rank SET boosts = boosts + $1 WHERE user_id = $2`,
                    [boosts, userId]
                );
            } else {
                await client.query(
                    `INSERT INTO boost_rank (user_id, username, boosts, first_boost_at) VALUES ($1, $2, $3, $4)`,
                    [userId, username, boosts, first_boost_at]
                );
            }
        }

        boostCache.clear();
        client.release();
        console.log('✅ Boost data saved.');
    } catch (err) {
        console.error('❌ Error saving boost data:', err);
    }
}, { timezone: 'Asia/Kolkata' });

// ✅ !boost command to show leaderboard
module.exports.execute = async (message) => {
    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT username, boosts,
                EXTRACT(DAY FROM NOW() - first_boost_at) AS days
            FROM boost_rank
            ORDER BY boosts DESC, days ASC
            LIMIT 10
        `);

        client.release();

        if (result.rows.length === 0) {
            return message.channel.send('No boost data available yet.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Server Boost Leaderboard')
            .setColor('#acf508')
            .setDescription(
                result.rows
                    .map((row, i) =>
                        `**#${i + 1}** | **${row.username}** - **Boosts:** ${row.boosts} | **Since:** ${row.days} days`
                    )
                    .join('\n') + `\n\n**Boosts** = Total boosts | **Since** = Days since first boost`
            );

        message.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ Error fetching boost leaderboard:', err);
        message.channel.send('An error occurred while retrieving the boost leaderboard.');
    }
};