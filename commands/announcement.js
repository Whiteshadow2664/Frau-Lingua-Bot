const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'announcement',
  description: 'Send an announcement to the general channel with @everyone ping',

  async execute(message, args) {
    // Check if the message author has the 'humans' role
    if (!message.member.roles.cache.some(role => role.name === 'humans')) {
      return message.reply('You do not have the required role to make an announcement.');
    }

    // Ask the moderator for the announcement message
    const askMessage = await message.reply('Please type the announcement message you want to send.');

    // Filter to ensure we get the correct response
    const filter = response => response.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, time: 30000, max: 1, errors: ['time'] });

    const announcementMessage = collected.first().content;

    // Check if the 'general' channel exists
    const announcementChannel = message.guild.channels.cache.find(channel => channel.name === 'general');
    if (!announcementChannel) {
      return message.reply('General channel not found.');
    }

    // Send the message to the 'general' channel with @everyone ping
    try {
      const sentMessage = await announcementChannel.send(`@everyone\n\n${announcementMessage}`);

      // Add reactions to the announcement message
      await sentMessage.react('👍');  // Thumbs up
      await sentMessage.react('🇩🇪');  // German flag
      await sentMessage.react('🇫🇷');  // French flag
      await sentMessage.react('🇷🇺');  // Russian flag
      await sentMessage.react('🎉');  // Celebration
      await sentMessage.react('🎊');  // Party Popper
      await sentMessage.react('🔥');  // Fire

      message.reply('Your announcement has been sent with reactions!');
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while sending the announcement.');
    }
  },
};