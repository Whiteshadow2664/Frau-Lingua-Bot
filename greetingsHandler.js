const greetings = {
    german: ['hallo', 'guten tag', 'servus'], // German greetings
    french: ['bonjour', 'salut'],            // French greetings
    russian: ['здравствуйте', 'привет'],    // Russian greetings
};

const responses = {
    german: {
        greeting: 'Wie geht es dir?',  // "How are you?" in German
        good: 'Das ist großartig!',    // "That's great!" in German
        aboutYou: 'Mir geht es gut, danke der Nachfrage!' // "I'm good, thanks for asking!" in German
    },
    french: {
        greeting: 'Comment ça va?',  // "How are you?" in French
        good: 'C’est génial!',       // "That's great!" in French
        aboutYou: 'Je vais bien, merci de demander!' // "I'm good, thanks for asking!" in French
    },
    russian: {
        greeting: 'Как дела?',      // "How are you?" in Russian
        good: 'Отлично!',           // "That's great!" in Russian
        aboutYou: 'Я в порядке, спасибо, что спросили!' // "I'm good, thanks for asking!" in Russian
    }
};

const handleGreeting = (message) => {
    const content = message.content.toLowerCase(); // Convert message to lowercase for matching

    // Check for each language's greetings
    if (greetings.german.some(greeting => content.includes(greeting))) {
        return responses.german.greeting;
    }
    if (greetings.french.some(greeting => content.includes(greeting))) {
        return responses.french.greeting;
    }
    if (greetings.russian.some(greeting => content.includes(greeting))) {
        return responses.russian.greeting;
    }

    // Check for responses like "I'm good" or "What about you?"
    if (content.includes('i\'m good') || content.includes('i am good')) {
        if (greetings.german.some(greeting => content.includes(greeting))) {
            return responses.german.good;
        }
        if (greetings.french.some(greeting => content.includes(greeting))) {
            return responses.french.good;
        }
        if (greetings.russian.some(greeting => content.includes(greeting))) {
            return responses.russian.good;
        }
    }

    if (content.includes('what about you')) {
        if (greetings.german.some(greeting => content.includes(greeting))) {
            return responses.german.aboutYou;
        }
        if (greetings.french.some(greeting => content.includes(greeting))) {
            return responses.french.aboutYou;
        }
        if (greetings.russian.some(greeting => content.includes(greeting))) {
            return responses.russian.aboutYou;
        }
    }

    // Return null if no match is found
    return null;
};

module.exports = { handleGreeting };