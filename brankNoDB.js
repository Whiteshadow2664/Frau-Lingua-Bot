const { EmbedBuilder, ChannelType } = require('discord.js');

const DISBOARD_BOT_ID = '540129267728515072';
const BUMP_MESSAGE_TEXT = 'Thx for bumping our Server!';

module.exports = {
    name: 'brank',
    description: 'Scan all channels and generate bump leaderboard (no DB)',

    async execute(message) {
        if (!message.guild) return;
        await message.channel.send('📊 Scanning messages for bump data. This may take a while...');

        const bumpCounts = {};

        const textChannels = message.guild.channels.cache.filter(
            channel => channel.type === ChannelType.GuildText && channel.viewable && channel.permissionsFor(message.client.user).has('ReadMessageHistory')
        );

        for (const [, channel] of textChannels) {
            try {
                let lastMessageId;
                let fetchComplete = false;

                while (!fetchComplete) {
                    const options = { limit: 100 };
                    if (lastMessageId) options.before = lastMessageId;

                    const messages = await channel.messages.fetch(options);
                    if (messages.size === 0) break;

                    for (const msg of messages.values()) {
                        // ✅ Check for bump message from Disboard bot
                        if (
                            msg.author.id === DISBOARD_BOT_ID &&
                            msg.content.includes(BUMP_MESSAGE_TEXT)
                        ) {
                            const match = msg.content.match(/<@!?(\d+)>/);
                            if (!match) continue;

                            const userId = match[1];
                            const user = await message.guild.members.fetch(userId).catch(() => null);
                            const username = user ? user.user.username : `User-${userId}`;

                            if (!bumpCounts[userId]) {
                                bumpCounts[userId] = { username, bumps: 1 };
                            } else {
                                bumpCounts[userId].bumps += 1;
                            }
                        }
                    }

                    lastMessageId = messages.last().id;

                    // Stop if fetched less than 100
                    if (messages.size < 100) {
                        fetchComplete = true;
                    }
                }
            } catch (err) {
                console.warn(`❌ Could not read messages in #${channel.name}:`, err.message);
                continue;
            }
        }

        const sorted = Object.entries(bumpCounts)
            .sort((a, b) => b[1].bumps - a[1].bumps)
            .slice(0, 10);

        if (sorted.length === 0) {
            return message.channel.send('No bump data found!');
        }

        const embed = new EmbedBuilder()
            .setTitle('📈 Bump Leaderboard (No DB)')
            .setColor('#acf508')
            .setDescription(
                sorted.map(([_, data], i) =>
                    `**#${i + 1}** | **${data.username}** — **Bumps:** ${data.bumps}`
                ).join('\n')
            )
            .setFooter({ text: 'Based on historical message scan' });

        message.channel.send({ embeds: [embed] });
    }
};
