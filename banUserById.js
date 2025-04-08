const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: 'banUserById',
  async execute(client) {
    const targetUserId = '474435857030316042';

    client.guilds.cache.forEach(async (guild) => {
      try {
        if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
          console.log(`❌ Missing Ban Members permission in ${guild.name}`);
          return;
        }

        const member = await guild.members.fetch(targetUserId).catch(() => null);

        await guild.members.ban(targetUserId, {
          reason: "Spreading hate towards Russians",
          deleteMessageSeconds: 60 * 60 * 24 * 7, // Delete messages from last 7 days
        });

        const logChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.viewable);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle("User Banned")
            .setDescription("Spreading hate towards Russians will result in a ban.")
            .setColor("#ff0000");

          await logChannel.send({ embeds: [embed] });
        }

        console.log(`✅ Banned ${targetUserId} from ${guild.name}`);
      } catch (err) {
        console.error(`❌ Failed to ban user from ${guild.name}:`, err);
      }
    });
  },
};