const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// Map to store user messages per channel
const userMessages = new Map();

// Channel ID where bot reports spam to moderators
const MOD_CHANNEL_ID = "1410902661372579863";

// Function to normalize message content (to catch similar messages)
function normalizeContent(message) {
    let content = message.content.trim().toLowerCase();

    // Replace links with placeholder
    content = content.replace(/https?:\/\/\S+/g, "[LINK]");

    // If the message has attachments (image, gif, file), mark them
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (attachment.contentType && attachment.contentType.startsWith("image/")) {
            return `[IMAGE] ${attachment.url}`;
        }
        if (attachment.contentType && attachment.contentType.startsWith("video/")) {
            return `[VIDEO] ${attachment.url}`;
        }
        return `[FILE] ${attachment.url}`;
    }

    return content;
}

module.exports = {
    async handleMessage(message) {
        if (message.author.bot) return; // ignore bots

        const userId = message.author.id;
        const channelId = message.channel.id;

        const normalized = normalizeContent(message);

        if (!userMessages.has(userId)) {
            userMessages.set(userId, new Map());
        }

        const channelMap = userMessages.get(userId);
        channelMap.set(channelId, normalized);

        // Get unique messages across channels
        const uniqueMessages = new Set(channelMap.values());

        if (uniqueMessages.size === 1 && channelMap.size >= 3) {
            // Possible spam detected
            try {
                // Delete the spam message
                await message.delete();

                // Try to mute the user
                const member = await message.guild.members.fetch(userId).catch(() => null);

                if (member) {
                    await member.timeout(
                        7 * 24 * 60 * 60 * 1000, // 1 week
                        "Suspected spam across multiple channels"
                    );
                }

                // Prepare embed for moderators
                const embed = new EmbedBuilder()
                    .setTitle("🚨 Possible Spam Detected")
                    .setColor("#acf508")
                    .addFields(
                        { name: "User", value: `<@${userId}> (${message.author.tag})`, inline: false },
                        { name: "Message", value: normalized.length > 1024 ? normalized.slice(0, 1020) + "..." : normalized, inline: false }
                    )
                    .setFooter({ text: "This user has been muted. Please review manually." })
                    .setTimestamp();

                const modChannel = await message.guild.channels.fetch(MOD_CHANNEL_ID);
                if (modChannel) {
                    await modChannel.send({ embeds: [embed] });
                }

                // Clear stored data for this user after reporting
                userMessages.delete(userId);
            } catch (err) {
                console.error("Error handling spam:", err);
            }
        }
    },
};