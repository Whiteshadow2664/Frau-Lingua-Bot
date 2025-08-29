const { EmbedBuilder } = require("discord.js");
const spamTracker = new Map();

module.exports = {
    async checkSpam(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        const userId = message.author.id;
        const guild = message.guild;
        const modLogChannelId = "1410902661372579863"; // Mods alert channel

        // Normalize message content (text, links, images, gifs)
        let normalizedContent = message.content?.trim() || "";
        let mediaUrl = null;

        if (message.attachments.size > 0) {
            const att = message.attachments.first(); // take only the first media/file
            if (att.contentType?.startsWith("image/") || att.url.endsWith(".gif")) {
                normalizedContent += ` [MEDIA: ${att.url}]`;
                mediaUrl = att.url;
            } else {
                normalizedContent += ` [FILE: ${att.url}]`;
                mediaUrl = att.url;
            }
        }

        if (!normalizedContent) return;

        // Track user messages by content and channel
        let userData = spamTracker.get(userId) || {};
        if (!userData[normalizedContent]) {
            userData[normalizedContent] = new Set();
        }

        userData[normalizedContent].add(message.channel.id);
        spamTracker.set(userId, userData);

        // If same message appears in 3+ different channels
        if (userData[normalizedContent].size >= 3) {
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
                }

                // Get Moderator role
                const modRole = guild.roles.cache.find(r => r.name === "Moderator");

                // Collect spammed channels for reporting
                const channelList = [...userData[normalizedContent]]
                    .map(chId => `<#${chId}>`)
                    .join(", ");

                // Send mod alert embed with spammed message content
                const embed = new EmbedBuilder()
                    .setColor("#acf508")
                    .setTitle("🚨 Possible Spam Account Detected")
                    .setDescription(
                        `User <@${userId}> may be spamming.\n\n` +
                        `They sent **the same/similar message** in **3 or more channels**.\n\n` +
                        `🔒 User has been given the **Muted role** (manual removal required).\n\n` +
                        `📩 Spam Message:\n\`\`\`${message.content || "N/A"}\`\`\`\n` +
                        (mediaUrl ? `🖼 Media: ${mediaUrl}\n\n` : "") +
                        `📌 Channels: ${channelList}`
                    )
                    .setTimestamp();

                const logChannel = guild.channels.cache.get(modLogChannelId);
                if (logChannel) {
                    if (modRole) {
                        await logChannel.send({ 
                            content: `<@&${modRole.id}> 🚨 Please review this case!`,
                            embeds: [embed] 
                        });
                    } else {
                        await logChannel.send({ embeds: [embed] });
                    }
                }

                // Clear from tracker after action
                spamTracker.delete(userId);

            } catch (err) {
                console.error("Error handling spam:", err);
            }
        }
    }
};