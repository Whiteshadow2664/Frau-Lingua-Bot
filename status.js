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
      activities: [{ name: status, type: 'CUSTOM' }], // Set the activity type to CUSTOM
      status: 'online', // Set the bot's online status (online, idle, dnd, invisible)
    });

    i++;
  }, 2000); // Change status every 5 seconds
};