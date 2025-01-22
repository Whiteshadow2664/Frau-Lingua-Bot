const { EmbedBuilder } = require('discord.js');

// Colors for embeds based on language
const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
};

// Function to shuffle an array in place using the Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to shuffle quiz options and update the correct answer's position
function shuffleQuizOptions(question) {
    if (!question || !question.options || question.options.length === 0) {
        throw new Error('Invalid question format or empty options');
    }

    // Get the correct answer
    const correctOption = question.correct;

    // Shuffle the options
    shuffleArray(question.options);

    // Ensure the correct answer is in the shuffled options
    if (!question.options.includes(correctOption)) {
        throw new Error('Correct answer is missing in options');
    }

    // Update the `correct` field to reflect the new position
    question.correctIndex = question.options.indexOf(correctOption);
}

// Function to clear the active quiz for a user
function clearActiveQuiz(activeQuizzes, userId) {
    if (activeQuizzes[userId]) {
        delete activeQuizzes[userId];
    }
}

// Function to track the active quiz for a user
function trackActiveQuiz(activeQuizzes, userId, quizData) {
    if (quizData && typeof quizData === 'object' && quizData.language && quizData.level) {
        activeQuizzes[userId] = quizData;
    } else {
        throw new Error('Invalid quiz data provided');
    }
}

// Function to generate a random item from an array (e.g., "Word of the Day")
function getRandomItem(array) {
    if (!Array.isArray(array) || array.length === 0) {
        throw new Error('Invalid array provided for random selection.');
    }
    return array[Math.floor(Math.random() * array.length)];
}

// Function to format a word's details into an embed-friendly format
function formatWordDetails(word) {
    if (!word || typeof word !== 'object') {
        throw new Error('Invalid word object');
    }

    return [
        { name: '**Meaning**', value: word.meaning || 'N/A', inline: false },
        { name: '**Plural**', value: word.plural || 'N/A', inline: false },
        { name: '**Indefinite Article**', value: word.indefinite || 'N/A', inline: false },
        { name: '**Definite Article**', value: word.definite || 'N/A', inline: false }
    ];
}

// Function to handle "Word of the Day" logic
function getWordOfTheDay(wordList, language) {
    const word = getRandomItem(wordList);
    return {
        word,
        language,
        formattedDetails: formatWordDetails(word),
    };
}

// Function to send a Word of the Day message
async function sendWordOfTheDay(message, wordList, language) {
    const wordOfTheDay = getWordOfTheDay(wordList, language);
    const embed = new EmbedBuilder()
        .setTitle(`Word of the Day - ${wordOfTheDay.language.toUpperCase()}`)
        .setDescription(`Today's word is **${wordOfTheDay.word.word}**`)
        .addFields(wordOfTheDay.formattedDetails)
        .setColor(embedColors[wordOfTheDay.language]);

    await message.channel.send({ embeds: [embed] });
}

// Function to shuffle quiz options
async function shuffleQuizAndSend(message, quizQuestions) {
    // Shuffle the options for each question
    quizQuestions.forEach(question => {
        shuffleQuizOptions(question);
    });

    // Send the quiz to the user with shuffled options
    for (const question of quizQuestions) {
        const embed = new EmbedBuilder()
            .setTitle(`Question: ${question.word}`)
            .setDescription(`Options:\n${question.options.join('\n')}`)
            .setColor(embedColors[question.language]);

        await message.channel.send({ embeds: [embed] });
    }
}

module.exports = {
    shuffleArray,
    shuffleQuizOptions,
    clearActiveQuiz,
    trackActiveQuiz,
    getRandomItem,
    formatWordDetails,
    getWordOfTheDay,
    sendWordOfTheDay,
    shuffleQuizAndSend
};