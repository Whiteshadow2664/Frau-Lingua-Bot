const { EmbedBuilder } = require('discord.js');

async function handleBanCommand(message) {
    try {
        if (
            message.author.id !== '540129267728515072' && 
            message.author.username !== 'whiteshadow_2664'
        ) return;

        const args = message.content.split(' ');
        const mention = message.mentions.users.first();

        if (!mention) {
            return message.reply('You must mention a user to ban.');
        }

        const member = await message.guild.members.fetch(mention.id).catch(() => null);

        if (member) {
            await message.guild.members.ban(member, { reason: 'Banned by bot command' });
        } else {
            await message.guild.bans.create(mention.id, { reason: 'Banned by bot command' });
        }

        // Attempt to delete messages (if still available)
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = fetchedMessages.filter(m => m.author.id === mention.id);
        await Promise.all(userMessages.map(m => m.delete().catch(() => null))); // Ignore errors

        // Confirmation Embed
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