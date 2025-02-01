const { EmbedBuilder } = require('discord.js');

async function handleBanCommand(message) {
    try {
        // Ensure the message mentions the bot and includes "ban"
        if (!message.mentions.has(message.client.user) || !message.content.toLowerCase().includes('ban')) return;

        // Restrict access to only whiteshadow_2664 (by ID)
        if (message.author.id !== '540129267728515072') return;

        const mention = message.mentions.users.first();
        if (!mention || mention.id === message.client.user.id) return;

        // Fetch the member (if still in the server)
        const member = await message.guild.members.fetch(mention.id).catch(() => null);

        if (member) {
            await message.guild.members.ban(member, { reason: 'Banned by bot command' });
        } else {
            await message.guild.bans.create(mention.id, { reason: 'Banned by bot command' });
        }

        // Delete recent messages (if available)
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = fetchedMessages.filter(m => m.author.id === mention.id);
        await Promise.all(userMessages.map(m => m.delete().catch(() => null))); // Ignore errors

        // Check if the message has already been processed
        if (message.processedBan) return;
        message.processedBan = true; // Mark as processed

        // Send confirmation embed
        const embed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`**${mention.tag}** has been banned.`)
            .setColor('#acf508');

        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Error banning user:', error);
        message.reply('There was an error banning the user.');
    }
}

module.exports = { handleBanCommand };