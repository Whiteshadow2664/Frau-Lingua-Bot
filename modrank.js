const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// PostgreSQL setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
});

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Keep-Alive Query
setInterval(async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
    } catch (err) {
        console.error('Error keeping database connection alive:', err);
    }
}, 300000);

// Auto-reconnect on connection loss
pool.on('error', async (err) => {
    console.error('Database connection lost. Reconnecting...', err);
});

// Ensure mod_rank table exists
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mod_rank (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                xp INTEGER NOT NULL DEFAULT 0,
                joined_at TIMESTAMP NOT NULL
            )
        `);
    } catch (err) {
        console.error('Error creating mod_rank table:', err);
    }
})();

// Function to update moderator XP
module.exports.updateModRank = async (userId, username, guild) => {
    try {
        const client = await pool.connect();

        const moderatorRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'moderator');
        if (!moderatorRole) return;

        const member = guild.members.cache.get(userId);
        if (!member || !member.roles.cache.has(moderatorRole.id)) {
            client.release();
            return;
        }

        const roleAssignedAt = member.roles.cache.get(moderatorRole.id).createdAt;

        const { data, error } = await supabase
            .from('mod_rank')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // Insert new record
            await supabase
                .from('mod_rank')
                .insert([{ user_id: userId, username, xp: 1, joined_at: roleAssignedAt }]);
        } else {
            // Update existing record
            await supabase
                .from('mod_rank')
                .update({ xp: data.xp + 1 })
                .eq('user_id', userId);
        }

        client.release();
    } catch (err) {
        console.error('Error updating moderator XP:', err);
    }
};

// Function to fetch and display moderator leaderboard
module.exports.execute = async (message) => {
    try {
        const client = await pool.connect();

        const leaderboardData = await supabase
            .from('mod_rank')
            .select('username, xp, joined_at')
            .order('xp', { ascending: false })
            .limit(10);

        client.release();

        if (!leaderboardData.data || leaderboardData.data.length === 0) {
            return message.channel.send('No moderator activity recorded yet.');
        }

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle('Moderator Leaderboard')
            .setColor('#acf508')
            .setDescription(
                leaderboardData.data
                    .map((row, index) => `**#${index + 1}** ${row.username} - **XP:** ${row.xp}`)
                    .join('\n')
            );

        message.channel.send({ embeds: [leaderboardEmbed] });
    } catch (error) {
        console.error('Error fetching moderator leaderboard:', error);
        message.channel.send('An error occurred while retrieving the moderator leaderboard.');
    }
};