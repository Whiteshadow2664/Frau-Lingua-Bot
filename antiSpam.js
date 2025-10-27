const { EmbedBuilder } = require("discord.js");

// Stores user message history: { userId: [ {content, channelId, timestamp} ] }
const spamHistory = new Map();

module.exports = {
    async checkSpam(message) {
        if (message.author.bot) return;

        const userId = message.author.id;
        const guild = message.guild;
        const modLogChannelId = "1224730855717470299";

        const now = Date.now();

        // Normalize message content
        let normalizedContent = message.content?.trim() || "";
        if (message.attachments.size > 0) {
            message.attachments.forEach(att => {
                if (att.contentType?.startsWith("image/") || att.url.endsWith(".gif")) {
                    normalizedContent += " [IMAGE/GIF]";
                } else {
                    normalizedContent += " [FILE]";
                }
            });
        }

        if (!normalizedContent) return;

        // Track history with timestamp
        if (!spamHistory.has(userId)) spamHistory.set(userId, []);
        spamHistory.get(userId).push({
            content: normalizedContent,
            channelId: message.channel.id,
            timestamp: now
        });

        // Keep only last 1 min entries
        const twoMins = 1 * 60 * 1000;
        const recent = spamHistory.get(userId).filter(m => now - m.timestamp < twoMins);
        spamHistory.set(userId, recent);

        // Count unique channels with same message
        const sameMessages = recent.filter(m => m.content === normalizedContent);
        const uniqueChannels = new Set(sameMessages.map(m => m.channelId));

        // ✅ SPAM DETECTED
        if (uniqueChannels.size >= 3) {
            try {
                // Delete messages from last 10 mins
                const tenMins = 10 * 60 * 1000;

                for (const channel of guild.channels.cache.values()) {
                    if (!channel.isTextBased()) continue;
                    const msgs = await channel.messages.fetch({ limit: 100 }).catch(() => {});
                    if (!msgs) continue;

                    const toDelete = msgs.filter(
                        m => m.author.id === userId &&
                        (now - m.createdTimestamp) < tenMins
                    );

                    for (const m of toDelete.values()) {
                        await m.delete().catch(() => {});
                    }
                }

                // Mute role
                let mutedRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("mute"));
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

                const member = guild.members.cache.get(userId);
                if (member) {
                    await member.roles.add(mutedRole, "Spammer detected");
                }

                const modRole = guild.roles.cache.find(r => r.name === "Moderator");

                const embed = new EmbedBuilder()
                    .setColor("#acf508")
                    .setTitle("🚫 Spammer Detected")
                    .setDescription(
                        `User <@${userId}> has been flagged as a spammer.\n\n` +
                        `🔁 Same message in **3+ channels** under **2 mins**.\n\n` +
                        `🔇 User muted & recent messages deleted.\n\n` +
                        `📝 Spam Content:\n\`\`\`${normalizedContent}\`\`\``
                    )
                    .setTimestamp();

                const logChannel = guild.channels.cache.get(modLogChannelId);
                if (logChannel) {
                    const payload = { embeds: [embed] };

                    if (modRole) {
                        payload.content = `<@&${modRole.id}> 🚨`;
                    }

                    await logChannel.send(payload);
                }

                spamHistory.delete(userId);

            } catch (err) {
                console.error("Spam handling error:", err);
            }
        }
    }
};