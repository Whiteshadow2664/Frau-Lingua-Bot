const { EmbedBuilder } = require('discord.js');

// Spam detection thresholds
const SPAM_LIMIT = 5; // Number of messages (5 messages)
const SPAM_TIMEFRAME = 5000; // Timeframe in milliseconds (5 seconds)
const WARNING_MESSAGE = 'Please avoid spamming!';
const TIMEOUT_DURATION = 300000; // Timeout duration in milliseconds (5 minutes)

// Track user messages and warnings
const userMessages = new Map(); // Store user messages and their timestamps
const userWarnings = new Map(); // Store warnings count for users
const userTimeouts = new Map(); // Store users currently in timeout

// Function to handle message creation (detect spam)
const handleSpamDetection = async (message) => {
  // Ignore bot messages or messages without content
  if (message.author.bot || !message.content) return;

  const userId = message.author.id;
  const currentTimestamp = Date.now();

  // Initialize user data if not already present
  if (!userMessages.has(userId)) {
    userMessages.set(userId, []);
    userWarnings.set(userId, 0);
  }

  const userMessageHistory = userMessages.get(userId);

  // Add the current message timestamp to the user's message history
  userMessageHistory.push(currentTimestamp);

  // Filter out messages older than the SPAM_TIMEFRAME
  const recentMessages = userMessageHistory.filter(timestamp => currentTimestamp - timestamp < SPAM_TIMEFRAME);

  // Clean up old message history if it exceeds the max size
  const MAX_HISTORY_SIZE = 100;
  if (userMessageHistory.length > MAX_HISTORY_SIZE) {
    userMessages.set(userId, userMessageHistory.slice(-MAX_HISTORY_SIZE));
  }

  // If user has exceeded spam limit
  if (recentMessages.length >= SPAM_LIMIT) {
    // Check if the user is already in a timeout
    if (userTimeouts.has(userId)) {
      // If the user is already in timeout, prevent further action
      return;
    }

    // Get current warning count
    const warningCount = userWarnings.get(userId);

    if (warningCount === 0) {
      // First warning: Notify the user and increment their warning count
      await message.channel.send(`${message.author}, ${WARNING_MESSAGE}`);
      userWarnings.set(userId, 1);
    } else if (warningCount === 1) {
      // Second offense: Timeout the user (5 minutes mute)
      const member = await message.guild.members.fetch(userId);
      if (member) {
        const role = message.guild.roles.cache.find(r => r.name === 'Muted'); // Ensure you have a "Muted" role
        if (role) {
          await member.roles.add(role); // Add the mute role to the user
          await message.channel.send(`${message.author} has been timed out for 5 minutes due to repeated spamming.`);
          userWarnings.set(userId, 0); // Reset the warning count
          userTimeouts.set(userId, Date.now()); // Track the timeout duration

          // Remove the mute role after the timeout duration
          setTimeout(async () => {
            await member.roles.remove(role); // Remove the mute role after 5 minutes
            userTimeouts.delete(userId); // Remove timeout tracking
          }, TIMEOUT_DURATION);
        }
      }
    }

    // Delete the spam messages (only within the SPAM_TIMEFRAME)
    try {
      const messagesToDelete = await message.channel.messages.fetch({ limit: 100 }); // Fetch last 100 messages
      const messagesToDeleteFiltered = messagesToDelete.filter(msg => 
        msg.author.id === userId && currentTimestamp - msg.createdTimestamp < SPAM_TIMEFRAME
      );

      // Ensure the deletion of each message is handled properly
      const deletePromises = [];
      for (const msg of messagesToDeleteFiltered.values()) {
        deletePromises.push(msg.delete().catch(error => console.error('Error deleting spam message:', error)));
      }
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting spam messages:', error);
    }
  }

  // Update the user's message history with recent messages
  userMessages.set(userId, recentMessages);
};

// Register the function with messageCreate event (you might need to adjust for your Discord.js version)
module.exports = { handleSpamDetection };