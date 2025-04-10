const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const router = express.Router();

// Shared secret
const SECRET = process.env.SECRET_TOKEN;

module.exports = (client) => {
    router.post('/send-message', async (req, res) => {
        const { token, message, channel, ping } = req.body;

        if (token !== SECRET) {
            return res.status(403).send('Forbidden: Invalid token');
        }

        try {
            const targetChannel = await client.channels.fetch(channel);
            if (!targetChannel || !targetChannel.isTextBased()) {
                return res.status(404).send('Channel not found or not text-based');
            }

            const content = ping ? `<@${ping}>\n${message}` : message;
            await targetChannel.send(content);

            res.status(200).send('Message sent successfully!');
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to send message.');
        }
    });

    return router;
};
