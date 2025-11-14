const { ActivityType } = require('discord.js');
const moment = require('moment-timezone');

const germanCities = [
    'Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
    'Vienna', 'Graz', 'Linz', 'Salzburg','Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Enschede', 'Apeldoorn', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Hertogenbosch', 'Zwolle', 'Leiden', 'Maastricht',
    'Dordrecht', 'Ede', 'Leeuwarden', 'Emmen', 'Sittard-Geleen', 'Venlo','Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne',
    'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Fribourg', 'Chur', 'Vernier', 'Neuchâtel', 'Uster', 'Sion',
    'Emmen', 'Kriens', 'Yverdon-les-Bains', 'Zug', 'Nyon', 'Rapperswil-Jona', 'Wetzikon', 'Dietikon', 'Montreux', 'Baar',
    'Frauenfeld', 'Wil', 'Bulle', 'Aarau', 'Wädenswil', 'Meyrin', 'Gossau', 'Brugg', 'Bellinzona', 'Thalwil', 'Deventer', 'Hilversum', 'Oss', 'Hoorn',
    'Heerlen', 'Purmerend', 'Roosendaal', 'Vlaardingen', 'Gouda', 'Alkmaar', 'Spijkenisse', 'Capelle aan den IJssel',
    'Rijswijk', 'Schiedam', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn',
    'Wiener Neustadt', 'Steyr', 'Feldkirch', 'Bregenz', 'Leonding', 'Kapfenberg', 'Krems an der Donau', 'Traun',
    'Amstetten', 'Lustenau', 'Hallein', 'Kufstein', 'Tulln', 'Mödling', 'Baden', 'Saalfelden', 'Schwechat',
    'Spittal an der Drau', 'Telfs', 'Bludenz', 'Eisenstadt', 'Ansfelden', 'Hohenems', 'Klosterneuburg', 'Gmunden',
    'Sankt Johann im Pongau', 'Perchtoldsdorf', 'Zwettl', 'Wolfsberg', 'Hartberg', 'Dresden', 'Leipzig', 'Nuremberg',
    'Bremen', 'Hannover', 'Münster', 'Aachen', 'Freiburg', 'Heidelberg', 'Mainz', 'Würzburg', 'Kassel', 'Paderborn',
    'Essen', 'Dortmund', 'Bonn', 'Mannheim', 'Karlsruhe', 'Kiel', 'Magdeburg', 'Rostock', 'Saarbrücken', 'Lübeck',
    'Erfurt', 'Regensburg', 'Osnabrück', 'Göttingen', 'Chemnitz', 'Cottbus', 'Koblenz', 'Ulm', 'Bielefeld', 'Flensburg'
];

function getGreeting() {
    const hour = moment().tz('Europe/Berlin').hour();
    if (hour >= 5 && hour < 12) {
        return 'Guten Morgen';
    } else if (hour >= 12 && hour < 18) {
        return 'Guten Tag';
    } else if (hour >= 18 && hour < 22) {
        return 'Guten Abend';
    } else {
        return 'Gute Nacht';
    }
}

function getRandomCity() {
    const randomIndex = Math.floor(Math.random() * germanCities.length);
    return germanCities[randomIndex];
}

let currentStatusIndex = 0;

async function updateBotStatus(client) {
    try {
        const statuses = [
            // Dynamically get city
            { type: ActivityType.Playing, text: getGreeting() },  // Dynamically get greeting
            { type: ActivityType.Playing, text: `Type !help` },
            { type: ActivityType.Watching, text: `Ich heiße Frau Lingua` },
            { type: ActivityType.Listening, text: `Ich komme aus ${getRandomCity()}` },{ type: ActivityType.Playing, text: `Have a Nice Day!` } 
        ];

        const status = statuses[currentStatusIndex];
        await client.user.setActivity(status.text, { type: status.type });

        currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    } catch (error) {
        console.error('Error updating bot status:', error);
    }
}

module.exports = { updateBotStatus };
