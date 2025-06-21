const { EmbedBuilder } = require('discord.js');

// Arcane bot ID and level-up regex patterns
const ARCANE_BOT_ID = '437808476106784770';
const LEVEL_50_REGEX = /<@(\d+)> has reached level \*\*50\*\*\. GG!/;
const LEVEL_100_REGEX = /<@(\d+)> has reached level \*\*100\*\*\. GG!/;

module.exports = {
    monitorLevelUps: (client) => {
        client.on('messageCreate', async (message) => {
            if (message.author.id !== ARCANE_BOT_ID) return;

            const level50Match = message.content.match(LEVEL_50_REGEX);
            const level100Match = message.content.match(LEVEL_100_REGEX);

            // Handle level 50
            if (level50Match) {
                const userId = level50Match[1];
                const embed = new EmbedBuilder()
                    .setColor('#acf508')
                    .setTitle('🎉 Level 50 Milestone Achieved!')
                    .setDescription(`A huge congratulations to <@${userId}> for reaching **Level 50**! 💪\n\nYour consistency and dedication are truly commendable. Keep pushing forward! 🚀`)
                    .setThumbnail('https://media.discordapp.net/attachments/1380957925471686770/1385881630119297095/20250621_124509.png?ex=6857ae59&is=68565cd9&hm=aa14fff6dadbbc00f8c99161adaafc99de41915eb707b341dd78c3f3ae9b28e5&=&width=680&height=680') // You can change this image
                    .setFooter({ text: 'Level 50 Club • Frau Lingua' })
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            // Handle level 100
            if (level100Match) {
                const userId = level100Match[1];
                const embed = new EmbedBuilder()
                    .setColor('#fcd303')
                    .setTitle('🌟 Legendary Level 100 Reached!')
                    .setDescription(
                        `Unbelievable! <@${userId}> has joined the elite by hitting **Level 100**! 🏆\n\n` +
                        `Your unwavering determination, endless effort, and relentless pursuit of excellence is truly inspiring. 🙌\n\n` +
                        `This milestone marks you as one of the most dedicated members of our community. 💖`
                    )
                    .setThumbnail('https://cdn.discordapp.com/attachments/1380957925471686770/1385881629787951134/20250621_124736.png?ex=6857ae58&is=68565cd8&hm=8c1795cc3e94a7adffe076a6e6e716bd7db8961e3a5d862576b1ad5b2a8f1dcd&') // Custom level 100 badge/icon
                    .setFooter({ text: 'Level 100 Legend • Frau Lingua' })
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }
        });
    }
};