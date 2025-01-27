const { MessageEmbed } = require('discord.js');

module.exports = (client) => {
    // List of suspicious patterns (you can add more as needed)
    const suspiciousLinks = [
        /steamgift\.com/i,        // Matches Steam Gift links
        /freegiftcards/i,         // Matches suspicious free gift card links
        /getfreegame/i,           // Matches free game links
        /discounts/i,             // Matches discount or offer links
        /.*\.ru$/,                // Matches Russian domain links (you can add more such patterns if needed)
        /.*\.xyz$/,               // Matches .xyz domain links (often used by suspicious websites)
        /steamcommunity\.com/i   // Matches StreamCommunity.com (new addition)
    ];

    // Listener for new messages
    client.on('messageCreate', async (message) => {
        // Ignore bot messages or messages without content
        if (message.author.bot || !message.content) return;

        // Check if the message contains any suspicious links
        const foundSuspiciousLink = suspiciousLinks.some(pattern => pattern.test(message.content));

        if (foundSuspiciousLink) {
            try {
                // Delete the suspicious message
                await message.delete();

                // Kick the user directly without sending a warning
                await message.guild.members.kick(message.author, { reason: "Sent suspicious link." });

                // Log the action (you can log this to a log channel)
                console.log(`Kicked ${message.author.tag} for sending a suspicious link.`);

                // Create the embed log for the action
                const logEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('User Kicked for Suspicious Link')
                    .setDescription(`${message.author.tag} was kicked for sending a suspicious link: ${message.content}`)
                    .setTimestamp();

                // Log the action to the specified log channel (1333351167941546018)
                const logChannel = message.guild.channels.cache.get('1333351167941546018');
                if (logChannel) logChannel.send({ embeds: [logEmbed] });

            } catch (err) {
                console.error('Error kicking user:', err);
            }
        }
    });
};