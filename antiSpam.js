const { EmbedBuilder } = require("discord.js");
const spamTracker = new Map();

module.exports = {
    async checkSpam(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        const userId = message.author.id;
        const guild = message.guild;
        const modLogChannelId = "1410902661372579863"; // Mods alert channel
        const muteDuration = 7 * 24 * 60 * 60 * 1000; // 1 week in ms

        // Track user messages by content and channel
        let userData = spamTracker.get(userId) || {};
        if (!userData[message.content]) {
            userData[message.content] = new Set();
        }

        userData[message.content].add(message.channel.id);
        spamTracker.set(userId, userData);

        // If same message appears in 3+ different channels
        if (userData[message.content].size >= 3) {
            try {
                // Delete the spam message
                await message.delete().catch(() => {});

                // Find or create Muted role
                let mutedRole = guild.roles.cache.find(r => r.name === "Muted");
                if (!mutedRole) {
                    mutedRole = await guild.roles.create({
                        name: "Muted",
                        color: "#555555",
                        permissions: []
                    });

                    guild.channels.cache.forEach(channel => {
                        channel.permissionOverwrites.create(mutedRole, {
                            SendMessages: false,
                            Speak: false,
                            AddReactions: false
                        }).catch(() => {});
                    });
                }

                // Apply mute
                const member = guild.members.cache.get(userId);
                if (member) {
                    await member.roles.add(mutedRole, "Spam detected in multiple channels");

                    // Schedule unmute
                    setTimeout(async () => {
                        if (member.roles.cache.has(mutedRole.id)) {
                            await member.roles.remove(mutedRole, "Auto unmute after 1 week");
                        }
                    }, muteDuration);
                }

                // Send mod alert embed
                const embed = new EmbedBuilder()
                    .setColor("#acf508")
                    .setTitle("🚨 Possible Spam Account Detected")
                    .setDescription(
                        `User <@${userId}> may be spamming.\n\n` +
                        `They sent **the same message** in **3 or more channels**.\n\n` +
                        `User has been **muted for 1 week**.`
                    )
                    .setTimestamp();

                const logChannel = guild.channels.cache.get(modLogChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }

                // Clear from tracker after action
                spamTracker.delete(userId);

            } catch (err) {
                console.error("Error handling spam:", err);
            }
        }
    }
};