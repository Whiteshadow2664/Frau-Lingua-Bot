const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'giverole',
  async execute(message) {
    if (!message.content.startsWith('!giverole')) return;
    if (!message.guild) return;

    const modRoles = ['Moderator', 'Admin'];
    const authorRoles = message.member.roles.cache.map(r => r.name);
    const authorId = message.author.id;

    const isModOrAdmin = authorRoles.some(role => modRoles.includes(role));
    const isWhitelistedUser = authorId === '540129267728515072';

    if (!isModOrAdmin && !isWhitelistedUser) {
      return message.reply("You don't have permission to use this command.");
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply("Please mention a user. Usage: `!giverole @user`");

    const embed = new EmbedBuilder()
      .setColor('#acf508')
      .setTitle('Assign Native Language Role')
      .setDescription('React to assign a **native role** to the mentioned user:\n\n🇩🇪 — German Native\n🇫🇷 — French Native\n🇷🇺 — Russian Native')
      .setFooter({ text: `Only ${message.author.username} can react.` });

    const prompt = await message.channel.send({ embeds: [embed] });

    await prompt.react('🇩🇪');
    await prompt.react('🇫🇷');
    await prompt.react('🇷🇺');

    const filter = (reaction, user) =>
      ['🇩🇪', '🇫🇷', '🇷🇺'].includes(reaction.emoji.name) &&
      user.id === message.author.id;

    const collector = prompt.createReactionCollector({ filter, max: 1, time: 20000 });

    collector.on('collect', async (reaction) => {
      let roleName;
      switch (reaction.emoji.name) {
        case '🇫🇷':
          roleName = 'French Native';
          break;
        case '🇩🇪':
          roleName = 'German Native';
          break;
        case '🇷🇺':
          roleName = 'Russian Native';
          break;
      }

      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        await prompt.delete().catch(() => {});
        return message.reply(`Role **${roleName}** not found.`);
      }

      await prompt.delete().catch(() => {});

      if (target.roles.cache.has(role.id)) {
        await target.roles.remove(role);
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#acf508')
              .setTitle('Role Removed')
              .setDescription(`${target} already had the **${roleName}** role. It has been removed.`)
          ]
        });
      } else {
        await target.roles.add(role);
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#acf508')
              .setTitle('Role Assigned Successfully')
              .setDescription(`${target} has been given the **${roleName}** role.`)
          ]
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        prompt.delete().catch(() => {});
        message.reply("You didn't react in time. Role was not assigned.");
      }
    });
  }
};