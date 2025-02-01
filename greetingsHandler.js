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
        haveNiceDay: 'Хорошо, хорошего дня!', // "Good, have a nice day!" in Russian
    }
};

// List of allowed channel IDs
const allowedChannelIds = [
    '818023867372011551',
    '1233064967109087292',
    '1225363050207514675',
    '1225362787581296640',
    '1303664003444379649'
];

let conversationState = {
    previousLanguage: null, // To track the last language used
    hasAskedHowAreYou: false, // To track if the bot has already asked "How are you?"
};

const handleGreeting = (message) => {
    // Check if the message is from an allowed channel
    if (!allowedChannelIds.includes(message.channel.id)) {
        return null; // Ignore if the message is from a channel that is not in the allowed list
    }

    const content = message.content.toLowerCase(); // Convert message to lowercase for matching

    // Special response for "Ich liebe Frau Lingua"
    if (content === 'ich liebe frau lingua') {
        return 'Ich liebe dich auch ❤️';
    }

    // Check for greetings in each language
    for (const [language, greetingsList] of Object.entries(greetings)) {
        if (greetingsList.some(greeting => content.includes(greeting))) {
            // If the user starts a new greeting
            conversationState.previousLanguage = language;
            conversationState.hasAskedHowAreYou = true; // Mark that the bot has asked "How are you?"
            return responses[language].greeting;
        }
    }

    // If the bot has already asked "How are you?" and user responds with anything
    if (conversationState.hasAskedHowAreYou) {
        const language = conversationState.previousLanguage;
        conversationState.previousLanguage = null; // Reset after completing the conversation
        conversationState.hasAskedHowAreYou = false; // Reset the flag
        return responses[language].haveNiceDay; // Respond with "Have a nice day"
    }

    // Return null if no match is found
    return null;
};

module.exports = { handleGreeting };