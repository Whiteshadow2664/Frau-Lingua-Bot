const { EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to update the leaderboard
module.exports.updateLeaderboard = async (username, language, level, points) => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('username', username)
            .eq('language', language)
            .eq('level', level)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "No rows found" error

        if (data) {
            await supabase
                .from('leaderboard')
                .update({ quizzes: data.quizzes + 1, points: data.points + points })
                .eq('id', data.id);
        } else {
            await supabase
                .from('leaderboard')
                .insert([{ username, language, level, quizzes: 1, points }]);
        }
    } catch (err) {
        console.error('Error updating leaderboard:', err);
    }
};

// Function to fetch and display the leaderboard
module.exports.execute = async (message) => {
    try {
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
            max: 1, time: 15000
        });

        if (!languageReaction.size) {
            await languageMessage.delete();
            return message.channel.send('No language selected. Command cancelled.');
        }

        const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.first().emoji.name)];
        await languageMessage.delete();

        const { data: leaderboardData, error } = await supabase
            .from('leaderboard')
            .select('username, quizzes, points, points::float / quizzes as avg_points')
            .eq('language', selectedLanguage)
            .order('points', { ascending: false })
            .limit(10);

        if (error) throw error;
        if (!leaderboardData.length) return message.channel.send(`No leaderboard data for ${selectedLanguage.toUpperCase()}.`);

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Leaderboard`)
            .setColor('#FFD700')
            .setDescription(
                leaderboardData.map(
                    (row, index) => `**#${index + 1}** ${row.username} - **Q:** ${row.quizzes} | **P:** ${row.points} | **AVG:** ${row.avg_points?.toFixed(2) ?? 'N/A'}`
                ).join('\n') + 
                `\n\n**Q** - Quizzes | **P** - Points | **AVG** - Avg points per quiz`
            );

        message.channel.send({ embeds: [leaderboardEmbed] });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        message.channel.send('An error occurred. Please try again.');
    }
};