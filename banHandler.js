const { EmbedBuilder } = require('discord.js');

const ALLOWED_USER_ID = '540129267728515072'; // Your Discord ID

async function handleBanCommand(message) {
    if (message.author.bot) return; // Ignore bot messages

    // Check if the command is used by the allowed user
    if (message.author.id !== ALLOWED_USER_ID) {
        return message.reply("You are not authorized to use this command.");
    }

    // Ensure the message is a reply
    if (!message.reference) return;

    try {
        // Fetch the replied-to message
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (!referencedMessage) return;

        const targetUserId = referencedMessage.author.id;

        // Ensure "ban" is in the message and the bot is mentioned
        if (!message.content.toLowerCase().includes('ban') || !message.mentions.has(message.client.user)) return;

        // Fetch messages from the user across the last 100 messages in the channel
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = fetchedMessages.filter(msg => msg.author.id === targetUserId);

        // Delete the user's messages
        await message.channel.bulkDelete(userMessages, true);

        // Attempt to fetch the member from the guild
        let targetMember = message.guild.members.cache.get(targetUserId);

        if (targetMember) {
            // Ban the user if they are still in the server
            await targetMember.ban({ reason: `Banned by ${message.author.tag}` });
        } else {
            // Ban the user by ID if they have already left the server
            await message.guild.bans.create(targetUserId, { reason: `Banned by ${message.author.tag}` });
        }

        // Confirmation message
        await message.reply('Yes boss!');

        // Send an embed with confirmation
        const embed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`**User ID: ${targetUserId}** has been banned.`)
            .setColor('#acf508');

        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Error banning user:', error);
        message.reply('There was an error banning this user.');
    }
}

module.exports = { handleBanCommand };