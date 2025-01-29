module.exports = (client) => {
  const statuses = [
    'Good Morning ☀️',  // 4 AM - 11:59 AM
    'Good Afternoon ☀️', // 12 PM - 2:59 PM
    'Good Evening 🌙',   // 3 PM - 8:59 PM
    'Good Night 🌙'      // 9 PM - 3:59 AM
  ];

  const updateStatus = () => {
    const currentHour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false });

    console.log(`Current Hour: ${currentHour}`); // Debugging line to check the current hour

    let status;
    if (currentHour >= 4 && currentHour < 12) {
      status = statuses[0]; // Good Morning
    } else if (currentHour >= 12 && currentHour < 15) {
      status = statuses[1]; // Good Afternoon
    } else if (currentHour >= 15 && currentHour < 21) {
      status = statuses[2]; // Good Evening
    } else {
      status = statuses[3]; // Good Night
    }

    console.log(`Updating status to: ${status} (IST Time: ${currentHour} hrs)`);

    // Set the bot presence
    client.user.setPresence({
      activities: [{ name: status, type: 'WATCHING' }],
      status: 'online', // Sets the status to 'online'
    })
    .then(() => console.log('Status updated successfully'))
    .catch(console.error); // Handle errors

  };

  updateStatus(); // Set initial status when bot starts

  // Update status every hour (3,600,000 ms)
  setInterval(updateStatus, 60 * 60 * 1000);
};