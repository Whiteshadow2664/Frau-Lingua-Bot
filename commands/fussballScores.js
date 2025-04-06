const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

// Relevant leagues with their IDs (from API-Football)
const TARGET_LEAGUES = {
  'UEFA Champions League': 2,
  'Premier League': 39,
  'Bundesliga': 78,
  'La Liga': 140,
  'Serie A': 135,
  'Ligue 1': 61,
  'FIFA World Cup': 1,
  'UEFA Euro Championship': 4,
  'Women World Cup': 1321,
  'A-League': 130
};

const getLiveScoresByLeague = async () => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const matches = response.data.response;

    // Group matches by league name
    const leagueMatches = {};

    for (const match of matches) {
      const leagueId = match.league.id;
      const leagueName = match.league.name;

      if (Object.values(TARGET_LEAGUES).includes(leagueId)) {
        const home = match.teams.home.name;
        const away = match.teams.away.name;
        const score = `${match.goals.home} - ${match.goals.away}`;
        const status = match.fixture.status.elapsed || match.fixture.status.short;

        const line = `**${home}** ${score} **${away}** (${status} min)`;

        if (!leagueMatches[leagueName]) leagueMatches[leagueName] = [];
        leagueMatches[leagueName].push(line);
      }
    }

    return leagueMatches;
  } catch (err) {
    console.error('Error fetching scores:', err);
    return null;
  }
};

const showLiveFootballScores = async (message) => {
  const leagueMatches = await getLiveScoresByLeague();

  if (!leagueMatches || Object.keys(leagueMatches).length === 0) {
    return message.channel.send('No live matches for selected leagues.');
  }

  const leagueNames = Object.keys(leagueMatches);
  let page = 0;

  const generateEmbed = (index) => {
    const league = leagueNames[index];
    const matches = leagueMatches[league].join('\n');

    return new EmbedBuilder()
      .setTitle(`${league} - Live Matches`)
      .setDescription(matches)
      .setColor('#acf508')
      .setTimestamp()
      .setFooter({ text: `Page ${index + 1} of ${leagueNames.length}` });
  };

  const embedMessage = await message.channel.send({ embeds: [generateEmbed(page)] });
  await embedMessage.react('◀️');
  await embedMessage.react('▶️');

  const collector = embedMessage.createReactionCollector({
    filter: (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot,
    time: 60000
  });

  collector.on('collect', (reaction, user) => {
    reaction.users.remove(user.id);
    if (reaction.emoji.name === '▶️') {
      page = (page + 1) % leagueNames.length;
    } else if (reaction.emoji.name === '◀️') {
      page = (page - 1 + leagueNames.length) % leagueNames.length;
    }
    embedMessage.edit({ embeds: [generateEmbed(page)] });
  });
};

module.exports = {
  showLiveFootballScores
};