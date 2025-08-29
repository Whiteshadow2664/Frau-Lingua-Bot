const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// Track messages per user across channels
const spamTracker = new Map();
const ALERT_CHANNEL_ID = "1410902661372579863"; // Moderators alert channel

module.exports = {
  async execute(message) {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      const userId = message.author.id;
      const content = message.content.trim();

      // Handle text or link
      let normalizedContent = content || "";

      // Check for attachments (files, images, gifs, etc.)
      if (message.attachments.size > 0) {
        // Represent files in normalized content for comparison
        normalizedContent =
          "FILE_UPLOAD:" + [...message.attachments.values()].map(a => a.name).join(", ");
      }

      // Initialize tracker if new user
      if (!spamTracker.has(userId)) {
        spamTracker.set(userId, new Map());
      }

      const userMessages = spamTracker.get(userId);
      const channelSet = userMessages.get(normalizedContent) || new Set();

      channelSet.add(message.channel.id);
      userMessages.set(normalizedContent, channelSet);

      // If same content/file appears in 3 or more different channels
      if (channelSet.size >= 3) {
        // Delete the current spam message
        await message.delete().catch(() => {});

        // Mute user (only if bot has permission)
        const member = message.guild.members.cache.get(userId);
        if (member) {
          await member.timeout(7 * 24 * 60 * 60 * 1000, "Possible spam account").catch(() => {});
        }

        // Prepare preview for mods
        let previewText = "";
        if (message.attachments.size > 0) {
          // Direct file uploads → show filename and 1 URL
          const attachment = message.attachments.first();
          previewText = `File Upload: ${attachment.name}\nURL: ${attachment.url}`;
        } else if (content.startsWith("http")) {
          previewText = `Link: ${content}`;
        } else {
          previewText = `Text: ${content.substring(0, 200)}`;
        }

        // Send alert embed to mods
        const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL_ID);
        if (alertChannel) {
          const embed = new EmbedBuilder()
            .setTitle("⚠️ Possible Spam Account Detected")
            .setColor("#acf508")
            .addFields(
              { name: "User", value: `<@${userId}> (${message.author.tag})`, inline: false },
              { name: "Message Preview", value: previewText || "N/A", inline: false },
              {
                name: "Action Taken",
                value: "User muted for 1 week (manual unmute by moderators required).",
                inline: false,
              }
            )
            .setTimestamp();

          await alertChannel.send({ embeds: [embed] });
        }

        // Reset tracker for this user to avoid repeated spam alerts
        spamTracker.delete(userId);
      }
    } catch (err) {
      console.error("Error in spamProtection:", err);
    }
  },
};