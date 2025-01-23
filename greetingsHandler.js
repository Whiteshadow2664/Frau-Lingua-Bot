const greetings = {
    german: ['hallo', 'guten tag', 'servus'], // German greetings
    french: ['bonjour', 'salut'],            // French greetings
    russian: ['здравствуйте', 'привет'],    // Russian greetings
};

const responses = {
    german: {
        greeting: 'Wie geht es dir?',  // "How are you?" in German
        haveNiceDay: 'Gut, hab einen schönen Tag!', // "Good, have a nice day!" in German
    },
    french: {
        greeting: 'Comment ça va?',  // "How are you?" in French
        haveNiceDay: 'Bien, passez une bonne journée!', // "Good, have a nice day!" in French
    },
    russian: {
        greeting: 'Как дела?',      // "How are you?" in Russian
        haveNiceDay: 'Хорошо, хорошего дня!' // "Good, have a nice day!" in Russian
    }
};

let conversationState = {
    previousLanguage: null, // To track the last language used
    hasAskedHowAreYou: false, // To track if the bot has already asked "How are you?"
};

const handleGreeting = (message) => {
    const content = message.content.toLowerCase(); // Convert message to lowercase for matching

    // Check for greetings in each language
    for (const [language, greetingsList] of Object.entries(greetings)) {
        if (greetingsList.some(greeting => content.includes(greeting))) {
            // If the user starts a new greeting
            conversationState.previousLanguage = language;
            conversationState.hasAskedHowAreYou = false; // Reset the state
            return responses[language].greeting;
        }
    }

    // If the bot has already asked "How are you?" and user replies
    if (conversationState.previousLanguage && !conversationState.hasAskedHowAreYou) {
        conversationState.hasAskedHowAreYou = true; // Mark "How are you?" as asked
        return responses[conversationState.previousLanguage].greeting; // Respond with "How are you?"
    }

    // If the bot should respond with "Have a nice day"
    if (conversationState.previousLanguage && conversationState.hasAskedHowAreYou) {
        const language = conversationState.previousLanguage;
        conversationState.previousLanguage = null; // Reset after completing the conversation
        conversationState.hasAskedHowAreYou = false;
        return responses[language].haveNiceDay; // Respond with "Have a nice day"
    }

    // Return null if no match is found
    return null;
};

module.exports = { handleGreeting };