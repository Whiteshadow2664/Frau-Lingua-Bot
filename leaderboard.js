const sqlite3 = require('sqlite3').verbose();
const { EmbedBuilder } = require('discord.js');
const db = new sqlite3.Database('./leaderboard.db');

// Create leaderboard table if not exists
db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        language TEXT,
        level TEXT,
        score INTEGER DEFAULT 0,
        quizzes_taken INTEGER DEFAULT 0
    )
`);

// Fetch leaderboard for a given language and level
const fetchLeaderboard = (selectedLanguage, selectedLevel) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM leaderboard
            WHERE language = ? AND level = ?
            ORDER BY score DESC, quizzes_taken ASC
            LIMIT 10
        `, [selectedLanguage, selectedLevel], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Update leaderboard (add score or create new record)
const updateLeaderboard = (userId, username, language, level, score) => {
    db.get(`
        SELECT * FROM leaderboard WHERE user_id = ? AND language = ? AND level = ?
    `, [userId, language, level], (err, row) => {
        if (!err) {
            if (row) {
                const newScore = row.score + score;
                const newQuizzesTaken = row.quizzes_taken + 1;

                db.run(`
                    UPDATE leaderboard
                    SET score = ?, quizzes_taken = ?
                    WHERE user_id = ? AND language = ? AND level = ?
                `, [newScore, newQuizzesTaken, userId, language, level]);
            } else {
                db.run(`
                    INSERT INTO leaderboard (user_id, username, language, level, score, quizzes_taken)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, username, language, level, score, 1]);
            }
        }
    });
};

// Main function to handle leaderboard selection and display
const displayLeaderboard = async (message) => {
    try {
        // Step 1: Select language
        const languageEmbed = new EmbedBuilder()
            .setTitle('Choose a Language for the Leaderboard')
            .setDescription('React to select the language:\n\n🇩🇪: German\n🇫🇷: French\n🇷🇺: Russian')
            .setColor('#1cd86c');

        const languageMessage = await message.channel.send({ embeds: [languageEmbed] });
        const languageEmojis = ['🇩🇪', '🇫🇷', '🇷🇺'];
        const languages = ['german', 'french', 'russian'];

        for (const emoji of languageEmojis) {
            await languageMessage.react(emoji);
        }

        const languageReactions = await languageMessage.awaitReactions({
            filter: (reaction, user) => languageEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
        });

        if (languageReactions.size === 0) {
            await languageMessage.delete();
            return message.channel.send('No language selected. Leaderboard cancelled.');
        }

        const languageReaction = languageReactions.first();
        const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.emoji.name)];
        await languageMessage.delete();

        // Step 2: Select level
        const levelSelectionEmbed = new EmbedBuilder()
            .setTitle(`Select Level for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Leaderboard`)
            .setDescription('React to select your level:\n\n🇦: A1\n🇧: A2\n🇨: B1\n🇩: B2\n🇪: C1\n🇫: C2')
            .setColor('#1cd86c');

        const levelMessage = await message.channel.send({ embeds: [levelSelectionEmbed] });
        const levelEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        for (const emoji of levelEmojis) {
            await levelMessage.react(emoji);
        }

        const levelReactions = await levelMessage.awaitReactions({
            filter: (reaction, user) => levelEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
        });

        if (levelReactions.size === 0) {
            await levelMessage.delete();
            return message.channel.send('No level selected. Leaderboard cancelled.');
        }

        const levelReaction = levelReactions.first();
        const selectedLevel = levels[levelEmojis.indexOf(levelReaction.emoji.name)];
        await levelMessage.delete();

        // Step 3: Fetch and display leaderboard
        const rows = await fetchLeaderboard(selectedLanguage, selectedLevel);

        if (rows.length === 0) {
            return message.channel.send(`No leaderboard data found for ${selectedLanguage} ${selectedLevel}.`);
        }

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} ${selectedLevel} Leaderboard`)
            .setColor('#1cd86c')
            .setDescription(rows.map((row, index) =>
                `**${index + 1}.** Rank: ${row.username} | Q: ${row.quizzes_taken} | P: ${row.score} | Avg: ${(row.score / row.quizzes_taken).toFixed(2)}`
            ).join('\n'));

        message.channel.send({ embeds: [leaderboardEmbed] });

    } catch {
        message.channel.send('An error occurred while displaying the leaderboard.');
    }
};

module.exports = { updateLeaderboard, displayLeaderboard };