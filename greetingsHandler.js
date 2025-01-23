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

let previousLanguage = null; // To keep track of the last language used

const handleGreeting = (message) => {
    const content = message.content.toLowerCase(); // Convert message to lowercase for matching

    // Check for greetings in each language
    if (greetings.german.some(greeting => content.includes(greeting))) {
        previousLanguage = 'german';
        return responses.german.greeting;
    }
    if (greetings.french.some(greeting => content.includes(greeting))) {
        previousLanguage = 'french';
        return responses.french.greeting;
    }
    if (greetings.russian.some(greeting => content.includes(greeting))) {
        previousLanguage = 'russian';
        return responses.russian.greeting;
    }

    // Check if user replies to the bot
    if (previousLanguage) {
        const language = previousLanguage;
        previousLanguage = null; // Reset after responding
        return `${responses[language].haveNiceDay} ${responses[language].greeting}`;
    }

    // Return null if no match is found
    return null;
};

module.exports = { handleGreeting };