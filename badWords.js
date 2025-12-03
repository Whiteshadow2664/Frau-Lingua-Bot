const badWords = [
  // English
  'cunt', 'dick', 'nigga', 'horny', 'motherfucker', 'mf', 'cum', 'smd', 'suck my dick',
  'mutterfucker', 'cock', 'pussy', 'bitch', 'hitler', 'nazi',
  'asshole', 'twat', 'shithead', 'douche', 'retard', 'slut', 'whore',
  'ballsack', 'screw you', 'suck it', 'fml', 'rape', 'pedophile', 'kill yourself', 'kys',
  'dumbfuck', 'booty', 'buttfuck', 'fuckface', 'shitface', 'bastard', 'tits', 'porn',
  'hentai', 'jerk off', 'wank', 'dickhead', 'fuckhead', 'sucka', 'sucker', 'piss off',
  'stfu', 'gtfo', 'hoe', 'eat shit', 'fag', 'faggot',
  'n1gga', 'fak u', 'fak off', 'ejaculate', 'blowjob',
  '69', 'lick me', 'spank me', 'anal', 'twerk', 'splooge', 'nut', 'boobs',
  'camel toe', 'thot', 'milf',  'orgasm',

  // French
  'pute', 'salope', 'enculé', 'connard', 'connasse', 'nique ta mère',
  'bordel', 'pd', 'sucer', 'fils de pute', 'branler', 'branlette', 'chatte', 'merde',
  'sodomie', 'cul', 'pornographie', 'milf', 'sperme', 'éjaculer',

  // German
  'fotze', 'arschloch', 'wichser', 'hurensohn', 'schlampe', 'ficken', 'verpiss dich', 'kacke', 'bumsen', 'blasen', 'titten', 'schwanz', 'arsch', 'porno',
  'hure', 'mutterficker', 'milf', 'sperma', 'ejakulieren', 'wichsen',

  // Russian
  'сука', 'блядь', 'пизда', 'хуй', 'гандон', 'мудила', 'ублюдок', 'пошел нахуй',
  'соси хуй', 'трахни меня', 'член', 'манда', 'сучка', 'порно', 'минет', 'анальный',
  'дрочить', 'сперма', 'эякуляция',

  // Emoji-based inappropriate symbols
  '🖕', '🖕🏻', '🖕🏼', '🖕🏽', '🖕🏾', '🖕🏿',
  '🍆', '🍑', '💦', '👅', '🫦', '💋', '🔞', '🩸'
];

const userOffenses = new Map();

/**
 * Check if a message contains any bad words.
 * @param {string} content The message content.
 * @returns {boolean} True if bad words are found, false otherwise.
 */
const containsBadWords = (content) => {
    const lower = content.toLowerCase();

    // Skip URLs
    if (/https?:\/\/\S+/.test(lower)) return false;

    // Split content into words
    const words = lower.split(/\s+/).filter(Boolean);

    return words.some(word => {
        // Ignore mentions
        if (/^<@!?[0-9]+>$/.test(word) || word.startsWith('@')) return false;

        return badWords.some(bad => {
            const badEscaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            if (/^[\p{Emoji}]+$/u.test(bad)) {
                // Emoji match
                return word === bad;
            } else {
                // Exact word match only
                return new RegExp(`\\b${badEscaped}\\b`, 'i').test(word);
            }
        });
    });
};

const hasModeratorRole = (member) => {
    return member.roles.cache.some((role) => role.name.toLowerCase() === 'moderator');
};

const trackOffenses = (userId) => {
    if (!userOffenses.has(userId)) {
        userOffenses.set(userId, 1);
    } else {
        userOffenses.set(userId, userOffenses.get(userId) + 1);
    }
    return userOffenses.get(userId);
};

const handleBadWords = async (message) => {
    if (containsBadWords(message.content)) {
        const member = message.member;

        try {
            await message.delete();
        } catch (error) {
            return;
        }

        if (hasModeratorRole(member)) {
            try {
                await message.channel.send({
                    content: `${member}, as a Moderator, please maintain decorum and avoid using inappropriate language and I'm not friendly like Owner.`,
                });
            } catch (error) {
                return;
            }
            return;
        }

        try {
            await message.channel.send({
                content: `${member}, your message was deleted because it contained inappropriate language. Continued use of bad words/emojis may result in a timeout.`,
            });
        } catch (error) {
            return;
        }

        const offenses = trackOffenses(member.id);

        if (offenses >= 2) {
            try {
                await member.timeout(5 * 60 * 1000, 'Repeated use of bad words');
                await message.channel.send({
                    content: `${member}, you have been timed out for 5 minutes due to repeated use of inappropriate language.`,
                });
            } catch (error) {
                // Silent fail
            }
        }
    }
};

module.exports = {
    handleBadWords,
    containsBadWords,
    hasModeratorRole,
};