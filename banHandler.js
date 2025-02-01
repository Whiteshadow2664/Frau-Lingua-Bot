const { EmbedBuilder } = require('discord.js');

async function handleBanCommand(message) {
    try {
        // Ensure the bot is mentioned and "ban" is in the message
        if (!message.mentions.has(message.client.user) || !message.content.toLowerCase().includes('ban')) return;

        // Restrict access to only whiteshadow_2664 (by ID)
        if (message.author.id !== '540129267728515072') return;

        const mention = message.mentions.users.first();
        if (!mention || mention.id === message.client.user.id) return;

        // Fetch the member (if still in the server)
        const member = await message.guild.members.fetch(mention.id).catch(() => null);

        if (member) {
            // Member still in the server, ban them
            await message.guild.members.ban(member, { reason: 'Banned by bot command' });
            console.log(`Banned member: ${mention.tag} (${mention.id})`);
        } else {
            // User is not in the server, ban them by ID
            await message.guild.bans.create(mention.id, { reason: 'Banned by bot command' });
            console.log(`Banned user who left: ${mention.tag} (${mention.id})`);
        }

        // Delete messages from the banned user
        message.guild.channels.cache.forEach(async (channel) => {
            if (channel.isTextBased()) {
                try {
                    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                    const userMessages = fetchedMessages.filter(m => m.author.id === mention.id);
                    await Promise.all(userMessages.map(m => m.delete().catch(() => null))); // Ignore errors
                } catch (err) {
                    console.error(`Error deleting messages in ${channel.name}:`, err);
                }
            }
        });

        // Prevent duplicate execution
        if (message.processedBan) return;
        message.processedBan = true;

        // Send confirmation embed
        const embed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`**${mention.tag}** has been banned.`)
            .addFields({ name: 'User ID', value: mention.id, inline: false })
            .setColor('#acf508');

        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Error banning user:', error);
        message.reply('There was an error banning the user.');
    }
}

module.exports = { handleBanCommand };