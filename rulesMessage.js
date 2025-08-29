// rulesMessage.js
const { EmbedBuilder } = require("discord.js");

const channelId = "1410887257635688528";

module.exports = async (client) => {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`Channel with ID ${channelId} not found`);
      return;
    }

    const rulesEmbed = new EmbedBuilder()
      .setTitle("📜 Server Rules")
      .setColor("#acf508")
      .setDescription(
        `1. Be respectful to everyone.\n\n` +
        `2. No Politics talks or topics should be raised.\n\n` +
        `3. No Racism, No Homophobia, and No Pedophilia. Usernames and statuses that have it will be an instant ban, and any jokes made about it will be an instant ban.\n\n` +
        `4. No inappropriate usernames, they will be changed.\n\n` +
        `5. No spamming in the discord server under any circumstance. (No arguing with mods on what is or is not spam).\n\n` +
        `6. No talking disrespectfully of other content creators.\n\n` +
        `7. Please keep the server to English, German, French, Russian or Hindi. If you can’t keep to metioned languages, you will be kicked.\n\n` +
        `8. If we find someone under 13 y/o, they will be banned according to Discord TOS.\n\n` +
        `9. Keep language and topics friendly. We want everyone to feel safe in this community.\n\n` +
        `10. Just listen to mods or admins, arguing or harassing mods or admins will lead to a mute/kick/ban.\n\n` +
        `11. If any of the above rules are violated, staff reserves the right to take the necessary action against the offender.\n\n` +
        `12. Anyone offering paid tutoring services must be verified or approved by the server staff before advertising their services.\n\n` +
        `13. Follow Discord Rules.`
      );

    const message = await channel.send({ embeds: [rulesEmbed] });

    // React with emojis
    const reactions = ["✅", "🇩🇪", "🇫🇷", "🇷🇺", "🇦🇹", "🇬🇧", "🇺🇸", "🇮🇳", "🇨🇦", "🇯🇵", "🇰🇷", "🇪🇸", "🇮🇹"];
    for (const emoji of reactions) {
      await message.react(emoji);
    }

    console.log("✅ Rules message sent successfully with reactions!");
  } catch (error) {
    console.error("❌ Error sending rules message:", error);
  }
};