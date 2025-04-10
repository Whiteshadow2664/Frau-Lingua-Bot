const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const AUTH_TOKEN = process.env.SECRET_TOKEN;

app.post('/send-message', async (req, res) => {
    const { token, message, channel, ping } = req.body;

    if (token !== AUTH_TOKEN) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const targetChannel = await client.channels.fetch(channel);
        if (!targetChannel || !targetChannel.send) {
            return res.status(400).send('Invalid channel');
        }

        let content = message;
        if (ping) {
            content = `<@${ping}>\n${message}`;
        }

        await targetChannel.send(content);
        res.send('Message sent successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to send message');
    }
});

client.login(process.env.DISCORD_TOKEN);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`Bot API server running on port ${PORT}`));