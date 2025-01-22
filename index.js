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
const { handleGreeting } = require('./greetingsHandler');

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
  russian: '19 20 * * *',  // 12:59 PM IST for Russian
  german: '24 20 * * *',   // 2:59 PM IST for German
  french: '24 20 * * *',   // 4:59 PM IST for French
};

Object.keys(wordOfTheDayTimes).forEach((language) => {
  cron.schedule(wordOfTheDayTimes[language], async () => {
    try {

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

    // Check if the message is a greeting in any language
    const response = handleGreeting(message);

    if (response) {
        // Reply with "How are you?" in the detected language
        await message.reply(response);
        return; // Exit after replying to avoid processing other commands
    }

    if (message.content.toLowerCase() === '!q') {
        // Check if the user is already participating in a quiz
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

            await Promise.all(levelEmojis.map((emoji) => levelMessage.react(emoji)));

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
                console.log(`No quiz data found for level: ${selectedLevel} in ${selectedLanguage}`);
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

                const quizReaction = await quizMessage.awaitReactions({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                const userReaction = quizReaction.first();
                if (userReaction) {
                    const correctEmoji = emojis[question.options.indexOf(question.correct)]; // Correct emoji for the answer
                    if (userReaction.emoji.name === correctEmoji) {
                        activeQuizzes[message.author.id].score++;
                    }
                }

// For each question, track the user's answer and compare it with the correct one
const correctEmoji = emojis[question.options.indexOf(question.correct)]; // Emoji for the correct answer
const userAnswer = userReaction ? question.options[emojis.indexOf(userReaction.emoji.name)] : 'No Answer';
const isCorrect = userReaction && userReaction.emoji.name === correctEmoji;

activeQuizzes[message.author.id].detailedResults.push({
    word: question.word,
    userAnswer: userAnswer,
    correct: question.correct,
    isCorrect: isCorrect,
});

                await quizMessage.delete();
            }


            // Step 4: Display Results
const result = activeQuizzes[message.author.id];
delete activeQuizzes[message.author.id];

// Create the detailed results text
const detailedResultsText = result.detailedResults
    .map(
        (res) =>
            `**Word:** ${res.word}\nYour Answer: ${res.userAnswer}\nCorrect: ${res.correct}\nResult: ${
                res.isCorrect ? '✅' : '❌'
            }`
    )
    .join('\n\n');

// Build the final result message
const resultEmbed = new EmbedBuilder()
    .setTitle('Quiz Results')
    .setDescription(
        `You scored ${result.score} out of ${result.detailedResults.length}!\n\n` + // Removed "in level ${result.level}"
        `**Level:** ${result.level}\n` +
        `**Language:** ${result.language.charAt(0).toUpperCase() + result.language.slice(1)}\n\n` +
        `**Detailed Results:**\n${detailedResultsText}`
    )
    .setColor(embedColors[result.language]);

// Send the result message
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