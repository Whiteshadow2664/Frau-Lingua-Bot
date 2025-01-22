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
  russian: '58 12 * * *',  // 12:59 PM IST for Russian
  german: '17 22 * * *',   // 2:59 PM IST for German
  french: '17 22 * * *',   // 4:59 PM IST for French
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

// Slash Command Registration
const { SlashCommandBuilder } = require('@discordjs/builders'); // Add this import

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    // Registering the /q command
    const commands = [
        new SlashCommandBuilder().setName('q').setDescription('Start a language quiz'),
        new SlashCommandBuilder().setName('help').setDescription('Get help information'),
        new SlashCommandBuilder().setName('resources').setDescription('Get language learning resources')
    ];

    // Register commands with Discord API
    await client.application.commands.set(commands);
});

// Commands and Event Handling
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'q') {
        // Check if the user is already participating in a quiz
        if (activeQuizzes[interaction.user.id]) {
            return interaction.reply('You are already participating in a quiz! Please finish it before starting a new one.');
        }

        try {
            // Step 1: Select Language
            const languageEmbed = new EmbedBuilder()
                .setTitle('Choose a Language for the Quiz')
                .setDescription('React to select the language:\n\n🇩🇪: German\n🇫🇷: French\n🇷🇺: Russian')
                .setColor(embedColors.default);

            const languageMessage = await interaction.channel.send({ embeds: [languageEmbed] });
            const languageEmojis = ['🇩🇪', '🇫🇷', '🇷🇺'];
            const languages = ['german', 'french', 'russian'];

            for (const emoji of languageEmojis) {
                await languageMessage.react(emoji);
            }

            const languageReaction = await languageMessage.awaitReactions({
                filter: (reaction, user) => languageEmojis.includes(reaction.emoji.name) && user.id === interaction.user.id,
                max: 1,
                time: 15000,
            });

            if (!languageReaction.size) {
                try {
                    await languageMessage.delete();
                } catch (err) {
                    console.error('Error deleting message:', err);
                }
                return interaction.reply('No language selected. Quiz cancelled.');
            }

            const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.first().emoji.name)];
            await languageMessage.delete();

            // Step 2: Select Level
            const levelEmbed = new EmbedBuilder()
                .setTitle(`Choose Your Level for the ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Quiz`)
                .setDescription('React to select your level:\n\n🇦: A1\n🇧: A2\n🇨: B1\n🇩: B2\n🇪: C1\n🇫: C2')
                .setColor(embedColors[selectedLanguage]);

            const levelMessage = await interaction.channel.send({ embeds: [levelEmbed] });
            const levelEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

            for (const emoji of levelEmojis) {
                await levelMessage.react(emoji);
            }

            const levelReaction = await levelMessage.awaitReactions({
                filter: (reaction, user) => levelEmojis.includes(reaction.emoji.name) && user.id === interaction.user.id,
                max: 1,
                time: 15000,
            }).catch(() => null);

            if (!levelReaction || !levelReaction.size) {
                await levelMessage.delete();
                return interaction.reply('No level selected or time expired. Quiz cancelled.');
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
                return interaction.reply('Invalid language selected. Quiz cancelled.');
            }

            // Ensure quiz data exists for the selected level
            if (!quizData || !quizData[selectedLevel]) {
                console.log(`No quiz data found for level: ${selectedLevel} in ${selectedLanguage}`);
                return interaction.reply(`No quiz data available for level ${selectedLevel} in ${selectedLanguage}.`);
            }

            // Extract questions and shuffle
            const questions = quizData[selectedLevel];
            shuffleArray(questions);

            // Select up to 5 questions to ask
            const questionsToAsk = questions.slice(0, 5);
            if (questionsToAsk.length === 0) {
                return interaction.reply('No questions available for this level. Quiz cancelled.');
            }

            activeQuizzes[interaction.user.id] = { language: selectedLanguage, level: selectedLevel, score: 0, detailedResults: [] };

            for (const question of questionsToAsk) {
                const embed = new EmbedBuilder()
                .setTitle(`**${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Vocabulary Quiz**`)
                .setDescription(
                    `What is the English meaning of **${question.word}**?`
                )
                .addFields(
                    { name: 'Options', value: question.options.join('\n'), inline: false }
                )
                .setColor(embedColors[selectedLanguage]);

                await interaction.channel.send({ embeds: [embed] });
            }

            // Final result (this part should be after all questions)
            const resultEmbed = new EmbedBuilder()
                .setTitle('Quiz Results')
                .setDescription(`Your final score is: **${activeQuizzes[interaction.user.id].score}/5**`)
                .setColor(embedColors[selectedLanguage]);

            await interaction.reply({ embeds: [resultEmbed] });

            // Clear quiz data for the user
            delete activeQuizzes[interaction.user.id];

        } catch (err) {
            console.error('Error starting quiz:', err);
            return interaction.reply('There was an error starting the quiz. Please try again.');
        }
    }
});

// Log in to Discord
client.login(DISCORD_TOKEN);