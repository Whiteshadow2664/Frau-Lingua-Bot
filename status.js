module.exports = (client) => {
  const statuses = [
    'Good Morning ☀️',  // 6 AM - 2 PM
    'Good Afternoon ☀️', // 2 PM - 10 PM
    'Good Evening 🌙',   // 10 PM - 2 AM
    'Good Night 🌙'      // 2 AM - 6 AM
  ];

  const updateStatus = () => {
    const currentHour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false });

    let status;
    if (currentHour >= 6 && currentHour < 14) {
      status = statuses[0]; // Good Morning
    } else if (currentHour >= 14 && currentHour < 22) {
      status = statuses[1]; // Good Afternoon
    } else if (currentHour >= 22 || currentHour < 2) {
      status = statuses[2]; // Good Evening
    } else {
      status = statuses[3]; // Good Night
    }

    client.user.setPresence({
      activities: [{ name: status, type: 'PLAYING' }],
      status: 'online',
    });

    console.log(`Updating status to: ${status} (IST Time: ${currentHour} hrs)`);
  };

  updateStatus(); // Set initial status when bot starts

  // Update status every 8 hours (28,800,000 ms)
  setInterval(updateStatus, 8 * 60 * 60 * 1000);
};