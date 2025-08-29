const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  const channelId = "1410887257635688528"; // rules channel ID
  const channel = await client.channels.fetch(channelId);
  if (!channel) return console.error("❌ Rules channel not found!");

  const rulesEmbed = new EmbedBuilder()
    .setColor("#acf508")
    .setTitle("📜 Server Rules")
    .setDescription(`
✅ **Be respectful to everyone.**

🚫 **No Politics talks or topics should be raised.**

🚷 **No Racism, No Homophobia, and No Pedophilia.**  
Usernames and statuses that have it will be an instant ban, and any jokes made about it will be an instant ban.

🙅 **No inappropriate usernames, they will be changed.**

📵 **No spamming in the discord server under any circumstance.**  
(No arguing with mods on what is or is not spam).

⚠️ **No talking disrespectfully of other content creators.**

🌐 **Please keep the server to English, German, French or Russian.**  
If you can’t keep to English or Hindi, you will be kicked.

🔞 **If we find someone under 13 y/o, they will be banned according to Discord TOS.**

🤝 **Keep language and topics friendly. We want everyone to feel safe in this community.**

🛡️ **Just listen to mods or admins.**  
Arguing or harassing mods/admins will lead to a mute/kick/ban.

💼 **Anyone offering paid tutoring services must be verified or approved by the server staff before advertising their services.**

📖 **Follow Discord Rules.**
    `)
    .setFooter({ text: "✅ React below to accept the rules & select your language!" });

  try {
    const message = await channel.send({ embeds: [rulesEmbed] });

    // React with emojis
    const reactions = [
      "✅",
      "🇩🇪", // German
      "🇫🇷", // French
      "🇷🇺", // Russian
      "🇦🇹", // Austrian
      "🏴󠁧󠁢󠁥󠁮󠁧󠁿", // England
      "🇺🇸", // USA
      "🇮🇳", // India
      "🇨🇦", // Canada
      "🌍", // Global
      "✨", // Sparkle
      "📚"  // Books
    ];

    for (const emoji of reactions) {
      await message.react(emoji).catch(err => console.error("Emoji failed:", emoji, err));
    }

    console.log("✅ Rules message sent and reactions added.");
  } catch (err) {
    console.error("❌ Failed to send rules message:", err);
  }
};