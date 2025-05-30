const { Client, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const languageColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#acf508'
};

// Ensure leaderboard table exists
async function ensureTableExists() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                language TEXT NOT NULL,
                level TEXT NOT NULL,
                quizzes INTEGER NOT NULL,
                points INTEGER NOT NULL
            )
        `);
        console.log("✅ Leaderboard table verified/created.");
    } catch (err) {
        console.error("❌ Error ensuring leaderboard table exists:", err);
    } finally {
        client.release();
    }
}

// Call table creation on startup
ensureTableExists();

// In-memory cache for quiz scores
const quizCache = new Map();

// Store quiz results in memory instead of writing to DB immediately
module.exports.updateLeaderboard = (username, language, level, points) => {
    const key = `${username}-${language}-${level}`;

    if (!quizCache.has(key)) {
        quizCache.set(key, { username, language, level, quizzes: 0, points: 0 });
    }

    const userData = quizCache.get(key);
    userData.quizzes += 1;
    userData.points += points;
};

// Scheduled task: Writes cached data to the database daily at 05:20 IST (09:58 UTC)
cron.schedule('20 05 * * *', async () => {  // 09:58 UTC = 05:20 IST
    console.log(`📝 Writing cached quiz data to the database at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}...`);

    if (quizCache.size === 0) {
        console.log('✅ No data to update.');
        return;
    }

    console.log(`🔄 Found ${quizCache.size} entries in cache. Processing...`);

    const client = await pool.connect();
    try {
        for (const [key, data] of quizCache) {
            console.log(`🔄 Updating DB for ${data.username} | Language: ${data.language} | Level: ${data.level} | Quizzes: ${data.quizzes} | Points: ${data.points}`);

            await client.query(
    `INSERT INTO leaderboard (username, language, level, quizzes, points)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (username, language, level)
     DO UPDATE SET 
        quizzes = leaderboard.quizzes + EXCLUDED.quizzes, 
        points = leaderboard.points + EXCLUDED.points`,
    [data.username, data.language, data.level, data.quizzes, data.points]
);
        }
        quizCache.clear(); // Clear the cache after writing
        console.log('✅ Database updated successfully.');
    } catch (err) {
        console.error(`❌ Error writing cached data to the database: ${err.message}\nStack: ${err.stack}`);
    } finally {
        client.release();
    }
}, { timezone: "Asia/Kolkata" });

module.exports.execute = async (message) => {
    try {
        const client = await pool.connect();

        const languageEmbed = new EmbedBuilder()
            .setTitle('Choose a Language for the Leaderboard')
            .setDescription('React to select the language:\n\n🇩🇪: German\n🇫🇷: French\n🇷🇺: Russian')
            .setColor('#acf508');

        const languageMessage = await message.channel.send({ embeds: [languageEmbed] });
        const languageEmojis = ['🇩🇪', '🇫🇷', '🇷🇺'];
        const languages = ['german', 'french', 'russian'];

        for (const emoji of languageEmojis) await languageMessage.react(emoji);

        const languageReaction = await languageMessage.awaitReactions({
            filter: (reaction, user) => languageEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
        });

        if (!languageReaction.size) {
            await languageMessage.delete();
            return message.channel.send('No language selected. Command cancelled.');
        }

        const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.first().emoji.name)];
        await languageMessage.delete();

        const levelEmbed = new EmbedBuilder()
            .setTitle(`Choose a Level for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Leaderboard`)
            .setDescription('React to select the level:\n\n🇦: A1\n🇧: A2\n🇨: B1\n🇩: B2\n🇪: C1\n🇫: C2')
            .setColor('#acf508');

        const levelMessage = await message.channel.send({ embeds: [levelEmbed] });
        const levelEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        for (const emoji of levelEmojis) await levelMessage.react(emoji);

        const levelReaction = await levelMessage.awaitReactions({
            filter: (reaction, user) => levelEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
        });

        if (!levelReaction.size) {
            await levelMessage.delete();
            return message.channel.send('No level selected. Command cancelled.');
        }

        const selectedLevel = levels[levelEmojis.indexOf(levelReaction.first().emoji.name)];
        await levelMessage.delete();

        const leaderboardData = await client.query(
            `SELECT username, quizzes, points, (points::FLOAT / quizzes) AS avg_points
            FROM leaderboard
            WHERE language = $1 AND level = $2
            ORDER BY points DESC, avg_points DESC
            LIMIT 10`,
            [selectedLanguage, selectedLevel]
        );

        client.release();

        if (leaderboardData.rows.length === 0) {
            return message.channel.send(`No leaderboard data found for ${selectedLanguage.toUpperCase()} ${selectedLevel}.`);
        }

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Level ${selectedLevel} Leaderboard`)
               .setColor(languageColors[selectedLanguage] || languageColors.default) // Dynamic color selection
            .setDescription(
                leaderboardData.rows
                    .map(
                        (row, index) => `**#${index + 1}** ${row.username} - **Q:** ${row.quizzes} | **P:** ${row.points} | **AVG:** ${row.avg_points.toFixed(2)}`
                    )
                    .join('\n') +
                `\n\n**Q** - No. of quizzes\n**P** - Points\n**AVG** - Average points per quiz`
            );

        message.channel.send({ embeds: [leaderboardEmbed] });
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        message.channel.send('An error occurred. Please try again.');
    }
};