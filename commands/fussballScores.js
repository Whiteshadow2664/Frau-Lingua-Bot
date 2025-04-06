const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY'; // Replace this with your actual API key

// League/Tournament IDs to include (from API-Football)
const allowedLeagueIds = [
  2,    // UEFA Champions League
  39,   // Premier League
  78,   // Bundesliga
  140,  // La Liga
  135,  // Serie A
  61,   // Ligue 1
  1,    // International (World Cup, Euros etc.)
];

const fetchLiveMatches = async () => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const allMatches = response.data.response;

    // Filter only selected leagues/tournaments
    const filtered = allMatches.filter(match => allowedLeagueIds.includes(match.league.id));
    return filtered;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const groupByLeague = (matches) => {
  const grouped = {};
  matches.forEach(match => {
    const leagueName = match.league.name;
    if (!grouped[leagueName]) grouped[leagueName] = [];
    grouped[leagueName].push(match);
  });
  return grouped;
};

const buildEmbeds = (groupedMatches) => {
  const embeds = [];

  for (const league in groupedMatches) {
    const matches = groupedMatches[league];
    const description = matches.map(m => {
      const home = m.teams.home.name;
      const away = m.teams.away.name;
      const score = `${m.goals.home} - ${m.goals.away}`;
      const status = m.fixture.status.elapsed || m.fixture.status.short;
      return `**${home}** ${score} **${away}** (${status} min)`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`${league} - Live Matches`)
      .setDescription(description)
      .setColor('#acf508')
      .setTimestamp();

    embeds.push(embed);
  }

  return embeds;
};

const showLiveScores = async (message) => {
  const matches = await fetchLiveMatches();
  if (!matches || matches.length === 0) {
    return message.channel.send('No live matches currently from selected leagues.');
  }

  const grouped = groupByLeague(matches);
  const embeds = buildEmbeds(grouped);

  let page = 0;
  const msg = await message.channel.send({ embeds: [embeds[page]] });

  if (embeds.length <= 1) return;

  await msg.react('◀️');
  await msg.react('▶️');

  const filter = (reaction, user) => {
    return ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
  };

  const collector = msg.createReactionCollector({ filter, time: 60000 });

  collector.on('collect', (reaction, user) => {
    reaction.users.remove(user.id).catch(() => {});
    if (reaction.emoji.name === '▶️') {
      page = (page + 1) % embeds.length;
    } else if (reaction.emoji.name === '◀️') {
      page = (page - 1 + embeds.length) % embeds.length;
    }
    msg.edit({ embeds: [embeds[page]] });
  });
};

module.exports = {
  showLiveScores
};