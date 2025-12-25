// deleteMessages.js
module.exports = {
    deleteMessages: async (client) => {
        const CHANNEL_ID = "1279821768785137686"; // put the channel where messages are
        const messageIds = [
            "1453590708513411205",
            "1453590645510766683",
            "1453590582130638912"
        ];

        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            for (const id of messageIds) {
                try {
                    const msg = await channel.messages.fetch(id);
                    if (msg) await msg.delete();
                    console.log(`✅ Deleted message ID: ${id}`);
                } catch (err) {
                    console.warn(`⚠️ Could not delete message ID ${id}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error("❌ Error fetching channel:", err);
        }
    }
};