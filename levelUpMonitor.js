const { EmbedBuilder } = require('discord.js');

// Arcane bot and regex
const ARCANE_BOT_ID = '437808476106784770';
const LEVEL_50_REGEX = /<@(\d+)> has reached level \*\*50\*\*\. GG!/;
const LEVEL_100_REGEX = /<@(\d+)> has reached level \*\*100\*\*\. GG!/;

// Replace with your actual role IDs
const GOLD_CLUB_ROLE_ID = '1386210453797212252';
const ELITE_CLUB_ROLE_ID = '1386211058594615426';

module.exports = {
    monitorLevelUps: (client) => {
        client.on('messageCreate', async (message) => {
            if (message.author.id !== ARCANE_BOT_ID) return;

            const level50Match = message.content.match(LEVEL_50_REGEX);
            const level100Match = message.content.match(LEVEL_100_REGEX);

            // 🎉 Level 50 Embed + Role Assignment
            if (level50Match) {
                const userId = level50Match[1];
                const member = await message.guild.members.fetch(userId).catch(() => null);

                if (member && !member.roles.cache.has(GOLD_CLUB_ROLE_ID)) {
                    await member.roles.add(GOLD_CLUB_ROLE_ID).catch(console.error);
                }

                const embed = new EmbedBuilder()
                    .setColor('#acf508')
                    .setTitle('🎉 Milestone Unlocked: Level 50!')
                    .setDescription(
                        `Let’s all cheer for <@${userId}> for reaching **Level 50**! 🥳\n\n` +
                        `Your consistency, drive, and effort are what make this community thrive.\n` +
                        `Welcome to the **Gold Club** — greatness awaits! 🌟`
                    )
                    .setThumbnail('https://media.discordapp.net/attachments/1380957925471686770/1385881630119297095/20250621_124509.png')
                    .setFooter({ text: 'Gold Club • Frau Lingua' })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }

            // 🌟 Level 100 Embed + Role Assignment
            if (level100Match) {
                const userId = level100Match[1];
                const member = await message.guild.members.fetch(userId).catch(() => null);

                if (member && !member.roles.cache.has(ELITE_CLUB_ROLE_ID)) {
                    await member.roles.add(ELITE_CLUB_ROLE_ID).catch(console.error);
                }

                const embed = new EmbedBuilder()
                    .setColor('#fcd303')
                    .setTitle('🌟 Legendary Achievement: Level 100!')
                    .setDescription(
                        `Astounding dedication from <@${userId}>! 🎖️\n\n` +
                        `You've officially joined the **Elite Club** by reaching **Level 100**.\n\n` +
                        `This is a mark of endurance, passion, and excellence — we're lucky to have you. 💎`
                    )
                    .setThumbnail('https://cdn.discordapp.com/attachments/1380957925471686770/1385881629787951134/20250621_124736.png')
                    .setFooter({ text: 'Elite Club • Frau Lingua' })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }
        });
    }
};
