module.exports = (client) => {
  const statuses = [
    'Hallo',
    'Bonjour',
    'Привет',
    'Welcome to LinguaLounge',
    "I'm Frau Lingua",
    'Type !help',
    'Type !quiz',
    'Monitoring You',
  ];

  let i = 0;

  setInterval(() => {
    if (i >= statuses.length) i = 0; // Reset index if at the end of the statuses
    const status = statuses[i];

    // Set the bot's presence (custom status)
    client.user.setPresence({
      activities: [{
        name: status, // Status text
        type: 'CUSTOM', // You can also change this to 'PLAYING', 'LISTENING', etc.
      }],
      status: 'online', // You can change this to 'idle', 'dnd', or 'invisible' based on the bot's need
    });

    // If any errors occur, they'll be logged to the console
    try {
      // Any additional logic can be added here if needed
    } catch (error) {
      console.error('Error setting presence:', error);
    }

    i++;
  }, 5000); // Change status every 5 seconds (5000 ms)
};