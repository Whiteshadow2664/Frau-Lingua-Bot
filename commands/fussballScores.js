const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const API_KEY = 'YOUR_API_KEY'; // Replace with your real API key

const getLiveScores = async () => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const matches = response.data.response;

    if (!matches.length) return 'No live matches currently.';

    const matchList = matches.map(match => {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const score = `${match.goals.home} - ${match.goals.away}`;
      const league = match.league.name;
      const status = match.fixture.status.elapsed;

      return `**${league}**\n${home} ${score} ${away} (${status} min)`;
    }).join('\n\n');

    return matchList;
  } catch (error) {
    console.error(error);
    return 'Error fetching live scores.';
  }
};

const showLiveScores = async (message) => {
  const liveScores = await getLiveScores();

  const embed = new EmbedBuilder()
    .setTitle('Live Football Scores')
    .setDescription(liveScores)
    .setColor('#1e90ff')
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};

module.exports = {
  showLiveScores
};