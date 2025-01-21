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
  russian: '30 18 * * *',  // 12:59 PM IST for Russian
  german: '30 18 * * *',   // 2:59 PM IST for German
  french: '30 18 * * *',   // 4:59 PM IST for French
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
        // Check if the user is already participating in a quiz
        if (activeQuizzes[message.author.id]) {
            return message.channel.send('You are already participating in a quiz! Please finish it before starting a new one.');
        }

        try {
            // Step 1: Select Language
            const languageEmbed = new EmbedBuilder()
                .setTitle('Choose a Language for the Quiz')
                .setDescription('React to select the language:\n\n🇩: German\n🇫: French\n🇷: Russian')
                .setColor(embedColors.default);

            const languageMessage = await message.channel.send({ embeds: [languageEmbed] });
            const languageEmojis = ['🇩', '🇫', '🇷'];
            const languages = ['german', 'french', 'russian'];

            for (const emoji of languageEmojis) {
                await languageMessage.react(emoji);
            }

            const languageReaction = await languageMessage.awaitReactions({
                filter: (reaction, user) => languageEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
            });

            if (!languageReaction.size) {
                return message.channel.send('No language selected. Quiz cancelled.');
            }

            const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.first().emoji.name)];
            await languageMessage.delete();

            // Step 2: Select Level
            const levelEmbed = new EmbedBuilder()
                .setTitle(`Choose Your Level for the ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Quiz`)
                .setDescription('React to select your level:\n\n🇦: A1\n🇧: A2\n🇨: B1\n🇩: B2\n🇪: C1\n🇫: C2')
                .setColor(embedColors[selectedLanguage]);

            const levelMessage = await message.channel.send({ embeds: [levelEmbed] });
            const levelEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

            for (const emoji of levelEmojis) {
                await levelMessage.react(emoji);
            }

            const levelReaction = await levelMessage.awaitReactions({
                filter: (reaction, user) => levelEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 15000,
            }).catch(() => null);

            if (!levelReaction || !levelReaction.size) {
                await levelMessage.delete();
                return message.channel.send('No level selected or time expired. Quiz cancelled.');
            }

            const selectedLevel = levels[levelEmojis.indexOf(levelReaction.first().emoji.name)];
            await levelMessage.delete();

            // Step 3: Start Quiz
            let quizData;
            if (selectedLanguage === 'german') {
                quizData = germanQuizData;
            } else if (selectedLanguage === 'french') {
                quizData = frenchQuizData;
            } else if (selectedLanguage === 'russian') {
                quizData = russianQuizData;
            } else {
                return message.channel.send('Invalid language selected. Quiz cancelled.');
            }

            // Ensure quiz data exists for the selected level
            if (!quizData || !quizData[selectedLevel]) {
                return message.channel.send(`No quiz data available for level ${selectedLevel} in ${selectedLanguage}.`);
            }

            // Extract questions and shuffle
            const questions = quizData[selectedLevel];
            shuffleArray(questions);

            // Select up to 5 questions to ask
            const questionsToAsk = questions.slice(0, 5);
            if (questionsToAsk.length === 0) {
                return message.channel.send('No questions available for this level. Quiz cancelled.');
            }

            activeQuizzes[message.author.id] = { language: selectedLanguage, level: selectedLevel, score: 0, detailedResults: [] };

            for (const question of questionsToAsk) {
                const embed = new EmbedBuilder()
                    .setTitle(`**${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Vocabulary Quiz**`)
                    .setDescription(`What is the English meaning of **"${question.word}"**?\n\nA) ${question.options[0]}\nB) ${question.options[1]}\nC) ${question.options[2]}\nD) ${question.options[3]}`)
                    .setColor(embedColors[selectedLanguage])
                    .setFooter({ text: 'React with the emoji corresponding to your answer.' });

                const quizMessage = await message.channel.send({ embeds: [embed] });
                const emojis = ['🇦', '🇧', '🇨', '🇩'];

                for (const emoji of emojis) {
                    await quizMessage.react(emoji);
                }

                const answerReaction = await quizMessage.awaitReactions({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    max: 1,
                    time: 15000,
                });

                if (!answerReaction.size) {
                    await quizMessage.delete();
                    return message.channel.send('Time expired! Quiz cancelled.');
                }

                const selectedOption = ['A', 'B', 'C', 'D'][emojis.indexOf(answerReaction.first().emoji.name)];
                const isCorrect = question.correctAnswer === selectedOption;

                activeQuizzes[message.author.id].score += isCorrect ? 1 : 0;
                activeQuizzes[message.author.id].detailedResults.push({
                    word: question.word,
                    answer: selectedOption,
                    correct: isCorrect,
                });

                // Send the result for this question
                const resultEmbed = new EmbedBuilder()
                    .setTitle(`**Quiz Question Result**`)
                    .setDescription(`Your answer for **"${question.word}"** was **${selectedOption}**.`)
                    .addFields(
                        { name: '**Correct Answer**', value: question.correctAnswer, inline: true },
                        { name: '**Your Score**', value: `${activeQuizzes[message.author.id].score}/5`, inline: true }
                    )
                    .setColor(isCorrect ? embedColors.default : '#ff0000')
                    .setFooter({ text: 'Good luck with the next question!' });

                await quizMessage.edit({ embeds: [resultEmbed] });
            }

            // Final result after 5 questions
            const finalResultEmbed = new EmbedBuilder()
                .setTitle('**Quiz Complete!**')
                .setDescription(`You scored **${activeQuizzes[message.author.id].score}/5** in the ${selectedLanguage} quiz.`)
                .setColor(activeQuizzes[message.author.id].score === 5 ? embedColors.default : '#ff0000')
                .setFooter({ text: 'Thanks for participating!' });

            await message.channel.send({ embeds: [finalResultEmbed] });

            // Clear the active quiz data for the user
            delete activeQuizzes[message.author.id];
        } catch (error) {
            console.error('Error during quiz:', error);
            message.channel.send('An error occurred while running the quiz. Please try again later.');
        }
    }
});

// Bot Login
client.login(DISCORD_TOKEN);