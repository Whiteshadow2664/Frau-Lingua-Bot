const express = require('express');
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const messageSender = require('./api/messageSender');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const app = express();
app.use(express.json());

client.once('ready', () => {
    console.log(`Bot API server is ready as ${client.user.tag}`);
    app.use('/', messageSender(client));
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`Bot API server running on port ${PORT}`));

// Login to Discord
client.login(process.env.DISCORD_TOKEN);