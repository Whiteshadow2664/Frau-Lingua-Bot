const { EmbedBuilder } = require('discord.js');

const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#acf508',
};

module.exports = {
    name: 'help',
    description: 'Displays help info for all server features and commands.',
    execute: async (message) => {
        const pages = [
            // Page 1: Quiz, Word of the Day, Study Resources
            new EmbedBuilder()
                .setTitle('📘 Help Menu - Page 1')
                .setDescription(
                    '**1. Quiz Rules**\n' +
                    '• Use **!quiz** to start the quiz.\n' +
                    '• Select language: 🇩🇪 🇫🇷 🇷🇺 and level: A1, A2, etc.\n' +
                    '• 5 questions, 1 min total. Score 5/5 = bonus point.\n' +
                    '• Tie-breaker: Higher average score ranks higher.\n\n' +
                    '**2. Word of the Day**\n' +
                    '• Posted daily in:\n' +
                    '   - 🇩🇪 <t:1737673200:t>\n' +
                    '   - 🇫🇷 <t:1737673200:t>\n' +
                    '   - 🇷🇺 <t:1737669600:t>\n\n' +
                    '**3. Study Resources**\n' +
                    '• Use **!resources** to get useful books, sites, and materials.'
                )
                .setColor(embedColors.default)
                .setThumbnail(message.client.user.displayAvatarURL())
                .setFooter({ text: 'Page 1/3 | Use ▶️ to continue' }),

            // Page 2: Suggestions, Tickets, Leaderboards
            new EmbedBuilder()
                .setTitle('📘 Help Menu - Page 2')
                .setDescription(
                    '**4. Suggestions**\n' +
                    '• Use **!suggestion** to submit ideas for the server.\n\n' +
                    '**5. Reporting Issues**\n' +
                    '• Open a ticket in <#1354835716647026748>.\n\n' +
                    '**6. Leaderboard**\n' +
                    '• Use **!leaderboard** for quiz rankings.\n' +
                    '• Tie-breaker: Higher average score.\n\n' +
                    '**7. Other Help**\n' +
                    '• Use **!exam** for German exam info.\n' +
                    '• Use **!tips** for study advice.\n' +
                    '• Use **!joke** for a fun break!'
                )
                .setColor(embedColors.default)
                .setThumbnail(message.client.user.displayAvatarURL())
                .setFooter({ text: 'Page 2/3 | Use ◀️▶️ to navigate' }),

            // Page 3: Full Command Guide
            new EmbedBuilder()
                .setTitle('📘 Help Menu - Page 3: Commands')
                .addFields(
                    {
                        name: '🔹 General Commands',
                        value:
                            '`!help` — Bot help\n' +
                            '`!resources` — Language material\n' +
                            '`!ddd` — Die Der Das game\n' +
                            '`!quiz` — Vocabulary quiz\n' +
                            '`!updates` — Recent updates\n' +
                            '`!leaderboard` — Quiz ranks\n' +
                            '`!modrank` — Mod activity\n' +
                            '`!tips` — Study advice\n' +
                            '`!class` — Events & classes\n' +
                            '`!exam` — German exams\n' +
                            '`!joke` — Random joke',
                        inline: false,
                    },
                    {
                        name: '🛠️ Moderator Commands',
                        value:
                            '`!purge` — Delete messages\n' +
                            '`!announcement` — Broadcast\n' +
                            '`!ws` — Worksheet\n' +
                            '`!ban` — Ban member\n' +
                            '`!kick` — Kick member\n' +
                            '`!mute` — Mute member',
                        inline: false,
                    }
                )
                .setColor(embedColors.default)
                .setThumbnail(message.client.user.displayAvatarURL())
                .setFooter({ text: 'Page 3/3 | Use ◀️ to go back' }),
        ];

        let currentPage = 0;

        const helpMessage = await message.channel.send({ embeds: [pages[currentPage]] });

        await helpMessage.react("◀️");
        await helpMessage.react("▶️");

        const filter = (reaction, user) => ["◀️", "▶️"].includes(reaction.emoji.name) && !user.bot;
        const collector = helpMessage.createReactionCollector({ filter, time: 3 * 60 * 1000 });

        collector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "▶️" && currentPage < pages.length - 1) {
                currentPage++;
            } else if (reaction.emoji.name === "◀️" && currentPage > 0) {
                currentPage--;
            }

            await helpMessage.edit({ embeds: [pages[currentPage]] });
            await reaction.users.remove(user.id);
        });

        collector.on("end", () => {
            helpMessage.reactions.removeAll().catch(() => {});
        });
    },
};
