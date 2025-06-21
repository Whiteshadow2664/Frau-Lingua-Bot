// boostTracker.js
const { EmbedBuilder, Events } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

// Replace these with actual IDs
const SERVER_BOOSTER_ROLE_ID = '852834921835790356';
const THANK_CHANNEL_ID = '818023867372011551';

const boostCache = new Map();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
});

// ✅ Ensure boost_rank table exists
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS boost_rank (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                boosts INTEGER NOT NULL DEFAULT 1,
                first_boost_at TIMESTAMP NOT NULL
            );
        `);
    } catch (err) {
        console.error('Error creating boost_rank table:', err);
    }
})();

// ✅ Trigger when Server Booster role is added
function registerBoostListener(client) {
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        const addedRole =
            !oldMember.roles.cache.has(SERVER_BOOSTER_ROLE_ID) &&
            newMember.roles.cache.has(SERVER_BOOSTER_ROLE_ID);

        if (!addedRole) return;

        const userId = newMember.id;
        const username = newMember.user.username;
        const now = new Date();

        if (!boostCache.has(userId)) {
            boostCache.set(userId, { username, boosts: 1, first_boost_at: now });
        }

        const thankYouEmbed = new EmbedBuilder()
            .setColor('#acf508')
            .setTitle('Thanks for Boosting the Server!')
            .setDescription(`Thank you <@${userId}> for boosting the server!\nYour support helps our community grow stronger!`)
            .setTimestamp();

        const thankChannel =
            newMember.guild.channels.cache.get(THANK_CHANNEL_ID) ||
            newMember.guild.systemChannel;

        if (thankChannel) {
            thankChannel.send({ embeds: [thankYouEmbed] }).catch(console.error);
        }

        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT * FROM boost_rank WHERE user_id = $1`, [userId]);

            if (result.rows.length > 0) {
                await client.query(`UPDATE boost_rank SET boosts = boosts + 1 WHERE user_id = $1`, [userId]);
            } else {
                await client.query(
                    `INSERT INTO boost_rank (user_id, username, boosts, first_boost_at) VALUES ($1, $2, $3, $4)`,
                    [userId, username, 1, now]
                );
            }

            client.release();
        } catch (err) {
            console.error('❌ Error saving boost on role assignment:', err);
        }
    });
}

// ✅ Backup: Save boostCache daily
cron.schedule(
    '17 12 * * *',
    async () => {
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
            console.error('❌ Error during cron boost save:', err);
        }
    },
    { timezone: 'Asia/Kolkata' }
);

// ✅ Command: !boosters (list only)
async function showBoosters(message) {
    try {
        const client = await pool.connect();
        const result = await client.query(`
            SELECT username, first_boost_at FROM boost_rank
            ORDER BY first_boost_at ASC
        `);
        client.release();

        if (result.rows.length === 0) {
            return message.channel.send('No one has boosted the server yet.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🚀 Server Boosters')
            .setColor('#acf508')
            .setDescription(
                result.rows
                    .map((row, i) =>
                        `**${i + 1}.** ${row.username} — Boosted on <t:${Math.floor(
                            new Date(row.first_boost_at).getTime() / 1000
                        )}:D>`
                    )
                    .join('\n')
            )
            .setFooter({ text: 'Thanks to all our boosters! 💖' });

        message.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ Error fetching boosters:', err);
        message.channel.send('An error occurred while retrieving the booster list.');
    }
}

module.exports = {
    registerBoostListener,
    showBoosters,
};
