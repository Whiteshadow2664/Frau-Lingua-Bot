module.exports = (client) => {
  // Set a static status
  const status = 'Type !help';

  const updateStatus = () => {
    // Set the bot presence
    client.user.setPresence({
      activities: [{ name: status, type: 'PLAYING' }],  // You can use 'PLAYING', 'WATCHING', or 'LISTENING'
      status: 'online', // Sets the status to 'online'
    })
    .catch(console.error); // Handle errors
  };

  updateStatus(); // Set initial status when bot starts

  // Optional: Update status at regular intervals (if desired, even though it is static)
  // setInterval(updateStatus, 60 * 60 * 1000);  // Update every hour (currently redundant with static status)
};