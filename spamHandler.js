const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const SPAM_LIMIT = 5; // Number of messages in timeframe
const SPAM_TIMEFRAME = 5000; // 5 seconds
const WARNING_MESSAGE = 'Please avoid spamming!';
const TIMEOUT_DURATION = 300000; // 5 minutes timeout

const userMessages = new Map();
const userWarnings = new Map();
const userTimeouts = new Map();

const handleSpamDetection = async (message) => {
  if (message.author.bot || !message.content) return;

  const userId = message.author.id;
  const currentTimestamp = Date.now();

  if (!userMessages.has(userId)) {
    userMessages.set(userId, []);
    userWarnings.set(userId, 0);
  }

  const userMessageHistory = userMessages.get(userId);
  userMessageHistory.push(currentTimestamp);

  const recentMessages = userMessageHistory.filter(
    (timestamp) => currentTimestamp - timestamp < SPAM_TIMEFRAME
  );

  if (recentMessages.length >= SPAM_LIMIT) {
    if (userTimeouts.has(userId)) return; // User already timed out

    const warningCount = userWarnings.get(userId);

    if (warningCount === 0) {
      await message.channel.send(`${message.author}, ${WARNING_MESSAGE}`);
      userWarnings.set(userId, 1);
    } else if (warningCount === 1) {
      try {
        const member = await message.guild.members.fetch(userId);
        if (member) {
          if (member.moderatable) {
            await member.timeout(TIMEOUT_DURATION, 'Spamming'); // Use Discord timeout feature
            await message.channel.send(
              `${message.author} has been timed out for 5 minutes due to repeated spamming.`
            );
          } else {
            let muteRole = message.guild.roles.cache.find((r) => r.name === 'Muted');
            if (!muteRole) {
              muteRole = await message.guild.roles.create({
                name: 'Muted',
                color: 'GRAY',
                permissions: [],
              });

              message.guild.channels.cache.forEach(async (channel) => {
                await channel.permissionOverwrites.create(muteRole, {
                  SendMessages: false,
                  Speak: false,
                });
              });
            }
            await member.roles.add(muteRole);
            await message.channel.send(
              `${message.author} has been muted for 5 minutes due to repeated spamming.`
            );
            setTimeout(async () => {
              await member.roles.remove(muteRole);
            }, TIMEOUT_DURATION);
          }

          userWarnings.set(userId, 0);
          userTimeouts.set(userId, Date.now());
        }
      } catch (error) {
        console.error('Error muting user:', error);
      }
    }

    // **Deleting Spam Messages**
    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(
        (msg) => msg.author.id === userId && currentTimestamp - msg.createdTimestamp < SPAM_TIMEFRAME
      );

      for (const msg of userMessages.values()) {
        try {
          await msg.delete();
        } catch (deleteError) {
          if (deleteError.code !== 10008) {
            console.error('Error deleting message:', deleteError);
          }
        }
      }
    } catch (fetchError) {
      console.error('Error fetching messages:', fetchError);
    }
  }

  userMessages.set(userId, recentMessages);
};

module.exports = { handleSpamDetection };