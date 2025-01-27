const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const rulesChannelId = '1224667724110893199'; // Channel ID for the rules channel

  const rulesEmbed = new EmbedBuilder()
    .setTitle('Server Rules')
    .setDescription('Please read and follow the rules below to ensure a safe and respectful community for everyone.')
    .addFields(
      { name: '#1', value: 'Be respectful to everyone.', inline: false },
      { name: '#2', value: 'No Politics talks or topics should be raised.', inline: false },
      { name: '#3', value: 'No Racism, No Homophobia, and No Pedophilia. Usernames and statuses that have it will be an instant ban, and any jokes made about it will be an instant ban.', inline: false },
      { name: '#4', value: 'No inappropriate usernames, they will be changed.', inline: false },
      { name: '#5', value: 'No spamming in the discord server under any circumstance. (No arguing with mods on what is or is not spam)', inline: false },
      { name: '#6', value: 'No talking disrespectfully of other content creators.', inline: false },
      { name: '#7', value: 'Please keep the server to English or Hindi, this is for our moderation team, if you can’t keep to English or Hindi it will be a kick.', inline: false },
      { name: '#8', value: 'If we find someone under 13 y/o, they will be banned according to Discord TOS.', inline: false },
      { name: '#9', value: 'Keep language and topics friendly, we want everyone to feel safe in this community.', inline: false },
      { name: '#10', value: 'Just listen to mods, arguing or harassing mods will lead to a mute/kick/ban.', inline: false },
      { name: '#11', value: 'If any of the above rules are violated, staff reserves the right to take the necessary action against the offender.', inline: false },
      { name: '#12', value: 'Anyone offering paid tutoring services must be verified or approved by the server staff before advertising their services.', inline: false },
      { name: '#13', value: 'Follow Discord Rules.', inline: false },
    )
    .setColor('#acf508')  // Red color for emphasis
    .setFooter({ text: 'Everything doesn\'t need to be mentioned in rules; use common sense. We expect all the members to be humble and respectful towards each other as well as welcoming towards new members.' })
    .setTimestamp();

  // Send the embed message to the rules channel (replace 'rules-channel-id' with the actual channel ID)
  client.once('ready', async () => {
    try {
      const rulesChannel = await client.channels.fetch(rulesChannelId);
      if (rulesChannel) {
        const message = await rulesChannel.send({
          embeds: [rulesEmbed],
          allowedMentions: { parse: [] }, // Disable @everyone or @here mentions
        });

        // Add reactions for acknowledgment (tick and other emojis)
        await message.react('✅'); // Tick emoji
        await message.react('❌'); // Cross emoji (or any other emojis you prefer)

        console.log('Rules embed sent!');
      } else {
        console.error('Could not find the rules channel.');
      }
    } catch (error) {
      console.error('Error sending rules embed:', error);
    }
  });
};