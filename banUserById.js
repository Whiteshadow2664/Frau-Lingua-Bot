module.exports = async (client) => {
  try {
    const channel = await client.channels.fetch("818023867372011551");
    if (channel && channel.isTextBased()) {
      const messages = await channel.messages.fetch({ limit: 13 });
      await channel.bulkDelete(messages, true);
      console.log("✅ Deleted 13 messages from the channel on startup.");
    } else {
      console.error("❌ Channel not found or is not a text-based channel.");
    }
  } catch (err) {
    console.error("❌ Error deleting messages on startup:", err);
  }
};