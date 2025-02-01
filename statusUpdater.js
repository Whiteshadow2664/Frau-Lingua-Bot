const { ActivityType } = require('discord.js');

// List of German cities
const germanCities = [
    'Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dresden', 'Leipzig', 'Nuremberg'
];

// Function to get the current greeting based on the time of day
function getGreeting() {
    const hour = new Date().getHours(); // Get the current hour of the day

    if (hour >= 5 && hour < 12) {
        return 'Guten Morgen'; // Morning (5 AM to 12 PM)
    } else if (hour >= 12 && hour < 18) {
        return 'Guten Nachmittag'; // Afternoon (12 PM to 6 PM)
    } else if (hour >= 18 && hour < 22) {
        return 'Guten Abend'; // Evening (6 PM to 10 PM)
    } else {
        return 'Guten Nacht'; // Night (10 PM to 5 AM)
    }
}

// Function to get the random German city for the "Ich komme and [city]" status
function getRandomCity() {
    const randomIndex = Math.floor(Math.random() * germanCities.length);
    return germanCities[randomIndex];
}

// Status messages array
let statuses = [
    { type: ActivityType.Playing, text: `Welcome to the LinguaLounge` },
    { type: ActivityType.Listening, text: `Ich komme and ${getRandomCity()}` },
    { type: ActivityType.Watching, text: `I'm Frau Lingua` },
    { type: ActivityType.Playing, text: getGreeting() }  // Dynamic greeting based on time of day
];

let currentStatusIndex = 0;

async function updateBotStatus(client) {
    try {
        // Set the bot's status to the current one
        const status = statuses[currentStatusIndex];
        await client.user.setActivity(status.text, { type: status.type });

        // Cycle through statuses every 10 seconds
        currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    } catch (error) {
        console.error('Error updating bot status:', error);
    }
}

module.exports = { updateBotStatus };