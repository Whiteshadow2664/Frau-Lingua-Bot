const greetings = {
    german: ['hallo', 'guten tag', 'servus'], // German greetings
    french: ['bonjour', 'salut'],            // French greetings
    russian: ['здравствуйте', 'привет'],    // Russian greetings
};

const responses = {
    german: 'Wie geht es dir?', // "How are you?" in German
    french: 'Comment ça va?',  // "How are you?" in French
    russian: 'Как дела?',      // "How are you?" in Russian
};

const handleGreeting = (message) => {
    const content = message.content.toLowerCase(); // Convert message to lowercase for matching

    // Check for each language's greetings
    if (greetings.german.some(greeting => content.includes(greeting))) {
        return responses.german;
    }
    if (greetings.french.some(greeting => content.includes(greeting))) {
        return responses.french;
    }
    if (greetings.russian.some(greeting => content.includes(greeting))) {
        return responses.russian;
    }

    // Return null if no match is found
    return null;
};

module.exports = { handleGreeting };