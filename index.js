// Active Quiz Tracking
const activeQuizzes = {};
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const cron = require('node-cron');
// Import quiz data
// Correct the import paths
const { russianQuizData, russianWordList } = require('./russianData');
const { germanQuizData, germanWordList } = require('./germanData');
const { frenchQuizData, frenchWordList } = require('./frenchData');

// Ensure shuffleArray is imported correctly
const { shuffleArray } = require('./utilities');
const help = require('./commands/help');
const resources = require('./commands/resources');

// Environment Variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
    console.error('Error: DISCORD_TOKEN environment variable is not set.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Express Server to Keep Bot Alive
const app = express();
app.get('/', (req, res) => {
    res.send('Bot is running!');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Embed Colors
const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#1cd86c',
};

// Word of the Day Data for each language
const wordOfTheDayChannelIds = {
    russian: '1327875414584201350', // Replace with actual Russian channel ID
    german: '1327875414584201350',   // Replace with actual German channel ID
    french: '1327875414584201350',   // Replace with actual French channel ID
};

// Word of the Day Function
const sendWordOfTheDay = async (language) => {
    let wordList;
    if (language === 'russian') wordList = russianWordList;
    else if (language === 'german') wordList = germanWordList;
    else if (language === 'french') wordList = frenchWordList;

    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const channelId = wordOfTheDayChannelIds[language];

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error(`Channel for ${language} not found!`);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('**Word of the Day**')
            .setDescription(`Today's Word of the Day is...\n\n**${randomWord.word}**`)
            .addFields(
                { name: '**Meaning**', value: randomWord.meaning, inline: false },
                { name: '**Plural**', value: randomWord.plural, inline: false },
                { name: '**Indefinite Article**', value: randomWord.indefinite, inline: false },
                { name: '**Definite Article**', value: randomWord.definite, inline: false }
            )
            .setColor(embedColors[language]); // Set the color based on language

        await channel.send({ embeds: [embed] });
        console.log(`Sent Word of the Day for ${language} to channel ${channelId}`);
    } catch (error) {
        console.error(`Error sending Word of the Day for ${language}:`, error);
    }
};

// Word of the Day Schedule for each language
const wordOfTheDayTimes = {
    russian: '46 18 * * *',  // 12:59 PM IST for Russian
    german: '46 18 * * *',   // 2:59 PM IST for German
    french: '46 18 * * *',   // 4:59 PM IST for French
};

// Send Word of the Day at scheduled times for each language
Object.keys(wordOfTheDayTimes).forEach((language) => {
    cron.schedule(wordOfTheDayTimes[language], async () => {
        try {
            console.log(`Sending Word of the Day for ${language} at scheduled time`);
            await sendWordOfTheDay(language);
        } catch (error) {
            console.error(`Failed to send Word of the Day for ${language}:`, error);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata', // Set timezone to Kolkata, India
    });
});

// Commands and Event Handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Handle the quiz command
    if (message.content.toLowerCase() === '!q') {
        if (activeQuizzes[message.author.id]) {
            return message.channel.send('You are already participating in a quiz! Please finish it before starting a new one.');
        }

        try {
            // Quiz logic here...
            for (const question of questionsToAsk) {
                const embed = new EmbedBuilder()
                    .setTitle(`**${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Vocabulary Quiz**`)
                    .setDescription(`**What is the English meaning of "${question.word}"?**\n\n${question.options.map((option, i) => `${['🇦', '🇧', '🇨', '🇩'][i]} ${option}`).join('\n\n')}`)
                    .setColor(embedColors[selectedLanguage])
                    .setFooter({ text: 'React with the emoji corresponding to your answer.' });

                const quizMessage = await message.channel.send({ embeds: [embed] });

                // Reactions handling...
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle('Quiz Results')
                .setDescription(`You scored ${result.score} out of 5 in level ${result.level} (${result.language.charAt(0).toUpperCase() + result.language.slice(1)})!`)
                .setColor(embedColors[result.language])
                .addFields(
                    { name: 'Level', value: result.level },
                    { name: 'Language', value: result.language.charAt(0).toUpperCase() + result.language.slice(1) },
                    {
                        name: 'Detailed Results',
                        value: result.detailedResults
                            .map((res) => `**Word:** ${res.word}\nYour Answer: ${res.userAnswer}\nCorrect Answer: ${res.correct}\nResult: ${res.isCorrect ? '✅' : '❌'}`)
                            .join('\n\n'),
                    }
                );

            await message.channel.send({ embeds: [resultEmbed] });
        } catch (error) {
            console.error(error);
            return message.channel.send('An error occurred. Please try again.');
        }
    }

    if (message.content.toLowerCase() === '!help') {
        help.execute(message);
    }

    if (message.content.toLowerCase() === '!resources') {
        resources.execute(message);
    }
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.login(DISCORD_TOKEN);