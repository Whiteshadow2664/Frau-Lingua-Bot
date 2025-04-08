module.exports = (client) => {
  client.channels.fetch("818023867372011551")
    .then(channel => {
      if (channel && channel.isTextBased()) {
        return channel.messages.fetch({ limit: 13 })
          .then(messages => channel.bulkDelete(messages, true))
          .then(() => console.log("✅ Deleted 13 messages from the channel on startup."));
      } else {
        console.error("❌ Channel not found or is not text-based.");
      }
    })
    .catch(err => {
      console.error("❌ Error deleting messages on startup:", err);
    });
};