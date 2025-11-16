// autoReactHello.js
const { Events } = require("discord.js");

module.exports = {
    name: "autoReactHello",

    init(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot) return;

            const targetChannelId = "1232747328608145439";
            if (message.channel.id !== targetChannelId) return;

            const content = message.content.toLowerCase();

            const greetings = [
                "hello", "hi", "hey", "name",
                "hallo", "guten tag", "servus",
                "bonjour", "salut", "coucou",
                "привет", "здравствуйте", "хай"
            ];

            const normalGreeting = greetings.some(word => content.includes(word));
            const imGreeting = /\b(i['’]?m|im)\s+\w+/i.test(message.content);

            if (normalGreeting || imGreeting) {
                try {
                    await message.react("👋");
                } catch (error) {
                    console.error("Failed to react to message:", error);
                }
            }
        });
    },
};