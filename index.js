// Active Quiz Tracking
const activeQuizzes = {};
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const cron = require('node-cron');
// Import quiz data
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

  } catch (error) {
    console.error(`Error sending Word of the Day for ${language}:`, error);
  }
};

// Word of the Day Schedule for each language
const wordOfTheDayTimes = {
  russian: '10 23 * * *',  // 12:59 PM IST for Russian
  german: '10 23 * * *',   // 2:59 PM IST for German
  french: '10 23 * * *',   // 4:59 PM IST for French
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
            // Step 1: Select Language
            const languageEmbed = new EmbedBuilder()
                .setTitle('Choose a Language for the Quiz')
                .setDescription('React to select the language:\n\n🇩🇪: German\n🇫🇷: French\n🇷🇺: Russian')
                .setColor(embedColors.default);

            const languageMessage = await message.channel.send({ embeds: [languageEmbed] });
            const languageEmojis = ['🇩🇪', '🇫🇷', '🇷🇺'];
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
                try {
                    await languageMessage.delete();  // Ensure the message is deleted after timeout
                } catch (err) {
                    console.error('Error deleting message:', err);  // Catch potential errors
                }
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

            const userReaction = levelReaction.first();
            if (!userReaction || !levelEmojis.includes(userReaction.emoji.name)) {
                await levelMessage.delete();
                return message.channel.send('Invalid reaction. Quiz cancelled.');
            }

            const selectedLevel = levels[levelEmojis.indexOf(userReaction.emoji.name)];
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

            if (!quizData || !quizData[selectedLevel]) {
                console.log(`No quiz data found for level: ${selectedLevel} in ${selectedLanguage}`);
                return message.channel.send(`No quiz data available for level ${selectedLevel} in ${selectedLanguage}.`);
            }

            const questions = quizData[selectedLevel];
            shuffleArray(questions);

            const questionsToAsk = questions.slice(0, 5);
            if (questionsToAsk.length === 0) {
                return message.channel.send('No questions available for this level. Quiz cancelled.');
            }

            activeQuizzes[message.author.id] = { language: selectedLanguage, level: selectedLevel, score: 0, detailedResults: [] };

            for (const question of questionsToAsk) {
                const embed = new EmbedBuilder()
                    .setTitle(`**${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Vocabulary Quiz**`)
                    .setDescription(
                        `What is the English meaning of **"${question.word}"**?\n\n` +
                        `${question.options[0]}\n\n` +
                        `${question.options[1]}\n\n` +
                        `${question.options[2]}\n\n` +
                        `${question.options[3]}`
                    )
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
}).catch(() => null);

await quizMessage.delete();

if (answerReaction && answerReaction.size) {
    const selectedAnswer = answerReaction.first().emoji.name;

    // Debugging log to check the selected answer and correct answer
    console.log('Correct Answer:', question.correct);
    console.log('Selected Answer:', selectedAnswer);

    const isCorrect = question.correct === selectedAnswer;

    activeQuizzes[message.author.id].score += isCorrect ? 1 : 0;

    // Directly match the emoji to the options
    const userAnswer = question.options.find(option => option.startsWith(selectedAnswer)); // Match the emoji to the option
    const correctAnswer = question.options.find(option => option.startsWith(question.correct)); // Match the emoji to the correct option

    activeQuizzes[message.author.id].detailedResults.push({
        word: question.word,
        userAnswer: userAnswer || 'No Answer',
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
    });
} else {
    activeQuizzes[message.author.id].detailedResults.push({
        word: question.word,
        userAnswer: 'No Answer',
        correctAnswer: question.options.find(option => option.startsWith(question.correct)),
        isCorrect: false,
    });
} else {
    activeQuizzes[message.author.id].detailedResults.push({
    word: question.word,
    userAnswer: question.options[answerIndex],
    correctAnswer: question.options[question.correctAnswer],  // This was the correct part, it's correct in concept, ensure it maps correctly in context
    isCorrect: isCorrect,
});
}
            }

            // Final Results
const resultsEmbed = new EmbedBuilder()
    .setTitle(`**Quiz Results for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Quiz**`)
    .setDescription(`You scored ${activeQuizzes[message.author.id].score} out of 5!`)
    .setColor(embedColors[selectedLanguage]);

activeQuizzes[message.author.id].detailedResults.forEach(result => {
    const resultMessage = `Your Answer: ${result.userAnswer}\nCorrect Answer: ${result.correctAnswer}\nCorrect: ${result.isCorrect ? '✅' : '❌'}`;
    resultsEmbed.addFields({
        name: `Word: ${result.word}`,
        value: resultMessage,
        inline: false
    });
});

await message.channel.send({ embeds: [resultsEmbed] });
            delete activeQuizzes[message.author.id]; // Remove the user from active quizzes after completion
        } catch (error) {
            console.error('Error handling quiz:', error);
        }
    }

    // Handle !help and !resources commands
    if (message.content.toLowerCase() === '!help') {
        help.execute(message);
    }

    if (message.content.toLowerCase() === '!resources') {
        resources.execute(message);
    }
});

// Log in to Discord
client.login(DISCORD_TOKEN);