const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const API_KEY = 'YOUR_NEWS_API_KEY'; // Replace with your actual News API key
const LANGUAGES = ['de', 'fr', 'ru', 'en'];
const LANGUAGE_NAMES = {
  de: 'Welt Nachrichten (Deutsch)',
  fr: 'Actualités Mondiales (Français)',
  ru: 'Мировые Новости (Русский)',
  en: 'World News (English)'
};

async function fetchHeadlines(lang) {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: 'general',
        language: lang,
        pageSize: 5,
        sortBy: 'publishedAt',
        apiKey: API_KEY
      }
    });

    const articles = response.data.articles;
    if (!articles.length) return 'Keine Nachrichten gefunden.';

    return articles.map((a, i) => `**${i + 1}. ${a.title}**\n${a.url}`).join('\n\n');
  } catch (err) {
    console.error(err);
    return 'Fehler beim Laden der Nachrichten.';
  }
}

async function showNews(message) {
  const embeds = [];

  for (const lang of LANGUAGES) {
    const headlines = await fetchHeadlines(lang);
    const embed = new EmbedBuilder()
      .setTitle(LANGUAGE_NAMES[lang])
      .setDescription(headlines)
      .setColor('#acf508')
      .setTimestamp();

    embeds.push(embed);
  }

  let index = 0;
  const msg = await message.channel.send({ embeds: [embeds[index]] });

  if (embeds.length > 1) {
    await msg.react('◀️');
    await msg.react('▶️');

    const filter = (reaction, user) =>
      ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      if (reaction.emoji.name === '▶️') {
        index = (index + 1) % embeds.length;
      } else if (reaction.emoji.name === '◀️') {
        index = (index - 1 + embeds.length) % embeds.length;
      }
      msg.edit({ embeds: [embeds[index]] });
    });
  }
}

module.exports = {
  showNews
};