const { EmbedBuilder } = require('discord.js'); const axios = require('axios'); const API_KEY = 'YOUR_API_KEY'; // Replace with your real API key

const TARGET_LEAGUES = [ 'UEFA Champions League', 'Premier League', 'Bundesliga', 'La Liga', 'Serie A', 'Ligue 1', 'FIFA World Cup', 'UEFA Euro', "Women's World Cup" ];

const getLiveScores = async () => { try { const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', { headers: { 'x-apisports-key': API_KEY } });

const matches = response.data.response; if (!matches.length) return null; const leagueMap = {}; matches.forEach(match => { const leagueName = match.league.name; if (!TARGET_LEAGUES.includes(leagueName)) return; if (!leagueMap[leagueName]) leagueMap[leagueName] = []; const home = match.teams.home.name; const away = match.teams.away.name; const score = `${match.goals.home} - ${match.goals.away}`; const status = match.fixture.status.elapsed; const time = status !== null ? `${status} min` : 'HT'; leagueMap[leagueName].push(`${home} ${score} ${away} (${time})`); }); return leagueMap; 

} catch (error) { console.error(error); return 'Error fetching live scores.'; } };

const showLiveScores = async (message) => { const data = await getLiveScores();

if (!data || typeof data === 'string') { return message.channel.send(data || 'No live matches currently.'); }

const leagueNames = Object.keys(data); if (!leagueNames.length) return message.channel.send('No live matches for selected leagues.');

let currentIndex = 0;

const createEmbed = (index) => { const league = leagueNames[index]; const embed = new EmbedBuilder() .setTitle(${league} - Live Scores) .setDescription(data[league].join('\n')) .setColor('#acf508') .setFooter({ text: Page ${index + 1} of ${leagueNames.length} }) .setTimestamp(); return embed; };

const embedMessage = await message.channel.send({ embeds: [createEmbed(currentIndex)] }); await embedMessage.react('◀️'); await embedMessage.react('▶️');

const collector = embedMessage.createReactionCollector({ filter: (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot, time: 60000 });

collector.on('collect', async (reaction, user) => { await reaction.users.remove(user.id);

if (reaction.emoji.name === '▶️') { currentIndex = (currentIndex + 1) % leagueNames.length; } else if (reaction.emoji.name === '◀️') { currentIndex = (currentIndex - 1 + leagueNames.length) % leagueNames.length; } await embedMessage.edit({ embeds: [createEmbed(currentIndex)] }); 

}); };

module.exports = { showLiveScores };

