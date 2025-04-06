const badWords = [
  // English
  'cunt', 'dick', 'nigga', 'horny', 'motherfucker', 'mf', 'cum', 'smd', 'suck my dick',
  'your mom', 'mutterfucker', 'cock', 'pussy', '6000', 'fuck you', 'bitch', 'hitler', 'nazi',
  'asshole', 'twat', 'shithead', 'douche', 'retard', 'slut', 'whore', 'fucker', 'dumbass',
  'ballsack', 'screw you', 'suck it', 'fml', 'rape', 'pedophile', 'kill yourself', 'kys',
  'dumbfuck', 'booty', 'buttfuck', 'fuckface', 'shitface', 'bastard', 'tits', 'porn',
  'hentai', 'jerk off', 'wank', 'dickhead', 'fuckhead', 'sucka', 'sucker', 'piss off',
  'stfu', 'gtfo', 'hoe', 'eat shit', 'ass', 'fag', 'faggot',
  'n1gga', 'fak u', 'fak off', 'sex', 'ejaculate', 'blowjob',
  '69', '420', 'lick me', 'spank me', 'anal', 'twerk', 'splooge', 'nut', 'boobs',
  'camel toe', 'balls', 'thot', 'milf', 'stepmom', 'bang', 'orgasm', 'moan',

  // French
  'pute', 'salope', 'enculé', 'bite', 'connard', 'connasse', 'nique ta mère', 'ta mère',
  'bordel', 'pd', 'sucer', 'fils de pute', 'branler', 'branlette', 'chatte', 'merde',
  'sodomie', 'cul', 'enculer', 'baise', 'pornographie', 'milf', 'sperme', 'éjaculer',

  // German
  'fotze', 'arschloch', 'wichser', 'hurensohn', 'schlampe', 'ficken', 'verpiss dich',
  'scheiße', 'kacke', 'bumsen', 'blasen', 'titten', 'schwanz', 'arsch', 'porno',
  'hure', 'mutterficker', 'milf', 'sperma', 'ejakulieren', 'wichsen',

  // Russian
  'сука', 'блядь', 'пизда', 'хуй', 'ебать', 'гандон', 'мудила', 'ублюдок', 'пошел нахуй',
  'соси хуй', 'трахни меня', 'член', 'манда', 'сучка', 'порно', 'минет', 'анальный',
  'дрочить', 'сперма', 'эякуляция',

  // Emoji-based inappropriate symbols
  '🖕', '🍆', '🍑', '💦', '👅', '🫦', '💋', '🔞', '🩸'
];
const userOffenses = new Map(); // To track user offenses

/**
 * Check if a message contains any bad words.
 * @param {string} content The message content.
 * @returns {boolean} True if bad words are found, false otherwise.
 */
const containsBadWords = (content) => {
    const lowerCaseContent = content.toLowerCase();
    return badWords.some((word) => lowerCaseContent.includes(word));
};

/**
 * Check if a user has the "Moderator" role.
 * @param {GuildMember} member The guild member to check.
 * @returns {boolean} True if the member has the "Moderator" role, false otherwise.
 */
const hasModeratorRole = (member) => {
    return member.roles.cache.some((role) => role.name.toLowerCase() === 'moderator');
};

/**
 * Track user offenses and apply timeouts if necessary.
 * @param {string} userId The user's ID.
 * @returns {number} The number of offenses by the user.
 */
const trackOffenses = (userId) => {
    if (!userOffenses.has(userId)) {
        userOffenses.set(userId, 1);
    } else {
        userOffenses.set(userId, userOffenses.get(userId) + 1);
    }
    return userOffenses.get(userId);
};

/**
 * Handle messages containing bad words.
 * @param {Message} message The message to handle.
 */
const handleBadWords = async (message) => {
    if (containsBadWords(message.content)) {
        const member = message.member;

        // Delete the bad word message
        try {
            await message.delete();
        } catch (error) {
            return;
        }

        // Check if the member has the "Moderator" role
        if (hasModeratorRole(member)) {
            // Send a warning specific to users with the "Moderator" role
            try {
                await message.channel.send({
                    content: `${member}, as a Moderator, please maintain decorum and avoid using inappropriate language and I'm not friendly like Owner.`,
                });
            } catch (error) {
                return;
            }
            return; // End processing for "Moderator" role members
        }

        // Send a general warning message
        try {
            await message.channel.send({
                content: `${member}, your message was deleted because it contained inappropriate language. Continued use of bad words may result in a timeout.`,
            });
        } catch (error) {
            return;
        }

        // Track offenses and apply a timeout if necessary
        const offenses = trackOffenses(member.id);

        if (offenses >= 2) {
            try {
                await member.timeout(5 * 60 * 1000, 'Repeated use of bad words'); // 5 minutes timeout
                await message.channel.send({
                    content: `${member}, you have been timed out for 5 minutes due to repeated use of inappropriate language.`,
                });
            } catch (error) {
                // Do nothing if the timeout fails
            }
        }
    }
};

module.exports = {
    handleBadWords,
    containsBadWords,
    hasModeratorRole,
};