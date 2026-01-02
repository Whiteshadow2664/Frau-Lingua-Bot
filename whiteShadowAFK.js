const TARGET_ID = "540129267728515072";
const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

// Store last reply time per channel (or global)
const cooldownMap = new Map();

module.exports = {
    async execute(message) {
        // Ignore bots
        if (message.author.bot) return;

        // Check for mention
        const mentioned =
            message.mentions.users.has(TARGET_ID) ||
            message.content.includes(`<@${TARGET_ID}>`);

        if (!mentioned) return;

        const now = Date.now();
        const lastUsed = cooldownMap.get(message.channel.id) || 0;

        // Cooldown check
        if (now - lastUsed < COOLDOWN_MS) return;

        cooldownMap.set(message.channel.id, now);

        await message.reply({
            content:
                "🔔 **Status Update**\n\n" +
                "White Shadow is currently **AFK** and will respond after the scheduled time:\n" +
                "**<t:1771569000:D>**",
            allowedMentions: { repliedUser: false }
        });
    }
};