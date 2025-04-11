const greetings = {
    german: ['hallo', 'guten tag', 'servus'],
    french: ['bonjour', 'salut'],
    russian: ['здравствуйте', 'привет'],
};

const responses = {
    german: {
        greeting: 'Wie geht es dir?',
        haveNiceDay: 'Gut, hab einen schönen Tag!',
        loveResponse: 'Ich liebe dich auch!',
    },
    french: {
        greeting: 'Comment ça va?',
        haveNiceDay: 'Bien, passez une bonne journée!',
        loveResponse: 'Je t’aime aussi!',
    },
    russian: {
        greeting: 'Как дела?',
        haveNiceDay: 'Хорошо, хорошего дня!',
        loveResponse: 'Я тоже тебя люблю!',
    },
    english: {
        loveResponse: 'I love you too!',
    }
};

const languageChannels = {
    german: '1225363050207514675',
    french: '1225362787581296640',
    russian: '1303664003444379649',
};

let conversationState = {
    previousLanguage: null,
    hasAskedHowAreYou: false,
};

const handleGreeting = (message) => {
    const content = message.content.toLowerCase();

    // Multilingual "I love you Frau Lingua"
    if (content === 'i love you frau lingua') return responses.english.loveResponse;
    if (content === 'ich liebe frau lingua') return responses.german.loveResponse;
    if (content === 'je t\'aime frau lingua') return responses.french.loveResponse;
    if (content === 'я люблю тебя frau lingua') return responses.russian.loveResponse;

    for (const [language, greetingsList] of Object.entries(greetings)) {
        if (greetingsList.some(greeting => content.includes(greeting))) {
            if (message.channel.id !== languageChannels[language]) {
                return null;
            }

            conversationState.previousLanguage = language;
            conversationState.hasAskedHowAreYou = true;
            return responses[language].greeting;
        }
    }

    if (conversationState.hasAskedHowAreYou) {
        const language = conversationState.previousLanguage;
        conversationState.previousLanguage = null;
        conversationState.hasAskedHowAreYou = false;

        if (message.channel.id === languageChannels[language]) {
            return responses[language].haveNiceDay;
        }
    }

    return null;
};

module.exports = { handleGreeting };