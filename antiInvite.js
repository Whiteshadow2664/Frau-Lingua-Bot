const { Events } = require("discord.js");

const warnedUsers = new Map(); // Track warnings
const allowedChannelId = "1342413437837377626"; // Allowed channel for invites

module.exports = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        const inviteRegex = /discord\.gg\/\w+/i; // Regex to detect invite links

        // Ignore if the message is in the allowed channel
        if (message.channel.id === allowedChannelId) return;

        if (inviteRegex.test(message.content)) {
            try {
                await message.delete(); // Delete the invite message
                
                const userId = message.author.id;
                const guildId = message.guild.id;
                const key = `${guildId}-${userId}`; // Unique key for the user in the server
                
                if (!warnedUsers.has(key)) {
                    // First offense, send a warning
                    warnedUsers.set(key, 1);
                    return message.channel.send(
                        `${message.author}, don't advertise your server! This isn't your dad's server. If you do this again, you'll be timed out.`
                    );
                } else {
                    // Second offense, timeout for 7 days
                    const member = await message.guild.members.fetch(userId);
                    if (member.moderatable) {
                        await member.timeout(7 * 24 * 60 * 60 * 1000, "Sent invite link twice.");
                        return message.channel.send(
                            `${message.author} has been timed out for 7 days for advertising servers.`
                        );
                    } else {
                        return message.channel.send(
                            `I don't have permission to timeout ${message.author}.`
                        );
                    }
                }
            } catch (error) {
                console.error("Error handling invite message:", error);
            }
        }
    });
};