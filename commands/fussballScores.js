const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

const getLiveF1Data = async () => {
  try {
    const response = await axios.get('https://v1.formula-1.api-sports.io/races?live=true', {
      headers: {
        'x-rapidapi-host': 'v1.formula-1.api-sports.io',
        'x-rapidapi-key': API_KEY
      }
    });

    const races = response.data.response;

    if (!races || races.length === 0) return 'No live Formula 1 races right now.';

    const race = races[0];
    const raceName = race.competition.name;
    const circuit = race.circuit.name;
    const laps = race.laps.total;
    const currentLap = race.laps.current;

    const resultList = race.results.map(result => {
      const driver = `${result.driver.name}`;
      const team = result.team.name;
      const position = result.position;
      const time = result.time || 'N/A';
      return `**${position}. ${driver}** (${team}) – ${time}`;
    }).join('\n');

    return `**${raceName}** at ${circuit}\nLap: ${currentLap}/${laps}\n\n${resultList}`;
  } catch (error) {
    console.error(error);
    return 'Error fetching Formula 1 live data.';
  }
};

const showLiveF1 = async (message) => {
  const f1Info = await getLiveF1Data();

  const embed = new EmbedBuilder()
    .setTitle('Formula 1 - Live Race')
    .setDescription(f1Info)
    .setColor('#e10600')
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};

module.exports = {
  showLiveF1
};