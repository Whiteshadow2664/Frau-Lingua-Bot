const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// PostgreSQL setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
    statement_timeout: 10000, // Set a timeout to prevent long queries
    query_timeout: 10000
});

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Keep the connection alive
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

// Ensure leaderboard table exists
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                language TEXT NOT NULL,
                level TEXT NOT NULL,
                quizzes INTEGER NOT NULL,
                points INTEGER NOT NULL
            )
        `);
    } catch (err) {
        console.error('Error initializing database:', err);
    }
})();

// Function to update the leaderboard
module.exports.updateLeaderboard = async (username, language, level, points) => {
    try {
        const client = await pool.connect();
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('username', username)
            .eq('language', language)
            .eq('level', level)
            .single();

        if (error || !data) {
            // Insert new record
            await supabase
                .from('leaderboard')
                .insert([{ username, language, level, quizzes: 1, points }]);
        } else {
            // Update existing record
            await supabase
                .from('leaderboard')
                .update({ quizzes: data.quizzes + 1, points: data.points + points })
                .eq('username', username)
                .eq('language', language)
                .eq('level', level);
        }
        
        client.release();
    } catch (err) {
        console.error('Error updating leaderboard:', err);
    }
};

// Function to fetch and display the leaderboard
module.exports.execute = async (message) => {
    try {
        const client = await pool.connect();

        const leaderboardData = await supabase
            .from('leaderboard')
            .select('username, quizzes, points')
            .order('points', { ascending: false })
            .limit(10);

        client.release();

        if (!leaderboardData.data || leaderboardData.data.length === 0) {
            return message.channel.send('No leaderboard data found.');
        }

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setColor('#FFD700')
            .setDescription(
                leaderboardData.data
                    .map(
                        (row, index) => `**#${index + 1}** ${row.username} - **Q:** ${row.quizzes} | **P:** ${row.points}`
                    )
                    .join('\n')
            );

        message.channel.send({ embeds: [leaderboardEmbed] });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        message.channel.send('An error occurred. Please try again.');
    }
};