const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg'); 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Neon DB
    },
    idleTimeoutMillis: 30000, // ✅ Auto-close idle connections after 30 seconds
}); 

// ✅ Keep-Alive Query to prevent disconnection
setInterval(async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
    } catch (err) {
        console.error('Error keeping database connection alive:', err);
    }
}, 300000); // Every 5 minutes 

// ✅ Auto-reconnect on connection loss
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
            );
        `);
    } catch (err) {
        console.error('Error creating mod_rank table:', err);
    }
})(); 

// Function to update moderator XP (1 message = 1 XP)
module.exports.updateModRank = async (userId, username, guild) => {
    try {
        const client = await pool.connect(); 

        // Check if user is a moderator
        const moderatorRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'moderator');
        if (!moderatorRole) return; 

        const member = guild.members.cache.get(userId);
        if (!member || !member.roles.cache.has(moderatorRole.id)) {
            client.release();
            return;
        } 

        // Get role assignment timestamp
        const roleAssignedAt = member.roles.cache.get(moderatorRole.id).createdAt; 

        const result = await client.query(`SELECT * FROM mod_rank WHERE user_id = $1`, [userId]); 

        if (result.rows.length > 0) {
            await client.query(`UPDATE mod_rank SET xp = xp + 1 WHERE user_id = $1`, [userId]);
        } else {
            await client.query(
                `INSERT INTO mod_rank (user_id, username, xp, joined_at) VALUES ($1, $2, 1, $3)`,
                [userId, username, roleAssignedAt]
            );
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

        const leaderboardData = await client.query(`
            SELECT username, xp, 
                EXTRACT(DAY FROM NOW() - joined_at) AS days,
                (xp::FLOAT / NULLIF(EXTRACT(DAY FROM NOW() - joined_at), 0)) AS avg_xp
            FROM mod_rank
            ORDER BY xp DESC, avg_xp DESC
            LIMIT 10
        `); 

        client.release(); 

        if (leaderboardData.rows.length === 0) {
            return message.channel.send('No moderator activity recorded yet.');
        } 

        const topUser = leaderboardData.rows[0]; // Get the top-ranked user
        const cheerMessage = `🎉 **${topUser.username} is leading the charge! Keep up the great work!** 🚀`; 

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle('Moderator Leaderboard')
            .setColor('#acf508')
            .setDescription(
                leaderboardData.rows
                    .map((row, index) => 
                        `**#${index + 1}** | **${row.days} Days** | **${row.username}** - **XP:** ${row.xp} | **AVG:** ${row.avg_xp ? row.avg_xp.toFixed(2) : '0.00'}`
                    )
                    .join('\n') + `\n\n${cheerMessage}\n\n**XP** = Total XP | **AVG** = Average XP per day`
            ); 

        message.channel.send({ embeds: [leaderboardEmbed] }); 

    } catch (error) {
        console.error('Error fetching moderator leaderboard:', error);
        message.channel.send('An error occurred while retrieving the moderator leaderboard.');
    }
};