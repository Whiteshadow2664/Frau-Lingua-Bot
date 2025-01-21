const { EmbedBuilder } = require('discord.js');

// Function to send quiz message
async function sendQuizMessage(channel, user, questionText, options) {
  const embed = new EmbedBuilder()
    .setTitle('Quiz Question')
    .setDescription(`${questionText}\n\n` + options.join('\n'))
    .setColor('#f4ed09')
    .setFooter({ text: 'React with the emoji corresponding to your answer.' });

  const quizMessage = await channel.send({ content: user.username, embeds: [embed] });

  // Add reactions based on options
  const reactions = ['🇦', '🇧', '🇨', '🇩'];
  for (let i = 0; i < reactions.length; i++) {
    await quizMessage.react(reactions[i]);
  }

  return quizMessage;
}

module.exports = { sendQuizMessage };