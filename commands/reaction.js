require('dotenv').config();

const MOD_ROLE_NAME = 'Moderator';
const ANNOUNCEMENT_CHANNEL_NAME = 'announcements';

module.exports = {
    name: 'reactrole',
    description: 'Set up a reaction role message in the announcements channel.',
    async execute(message, client) {
        const isMod = message.member.roles.cache.some(
            role => role.name.toLowerCase() === MOD_ROLE_NAME.toLowerCase()
        );
        if (!isMod) return message.reply('Only Moderators can use this command.');

        const prompt1 = await message.reply('Please type the message you want to send for reaction roles.');
        const filter = m => m.author.id === message.author.id && !m.author.bot;

        const collector1 = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });
        collector1.on('collect', async msg1 => {
            const roleMessage = msg1.content;

            const prompt2 = await message.reply('Now react to this message with a default emoji you want to use and don\'t use Nitro Exclusive or Animated or Other Server emojis.');
            try {
                await prompt2.react('✅');
            } catch (err) {
                console.warn('Could not react with default emoji:', err);
            }

            const reactionCollector = prompt2.createReactionCollector({
                filter: (reaction, user) => user.id === message.author.id,
                max: 1,
                time: 300000
            });

            reactionCollector.on('collect', async (reaction) => {
                const emoji = reaction.emoji;

                const prompt3 = await message.reply('Please mention the role to assign (e.g., @Frau Lingua).');

                const roleCollector = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });
                roleCollector.on('collect', async msg2 => {
                    const roleMention = msg2.mentions.roles.first();
                    if (!roleMention) return msg2.reply('No valid role mentioned.');

                    const roleToAssign = roleMention;
                    const announcementChannel = message.guild.channels.cache.find(
                        ch => ch.name.toLowerCase() === ANNOUNCEMENT_CHANNEL_NAME && ch.isTextBased()
                    );

                    if (!announcementChannel) {
                        return message.reply('Announcement channel not found.');
                    }

                    try {
                        const sentMessage = await announcementChannel.send(roleMessage);
                        await sentMessage.react(emoji);

                        await message.reply(`Reaction role message sent successfully in #${ANNOUNCEMENT_CHANNEL_NAME}.`);

                        // Listen for reactions and assign role
                        const assignCollector = sentMessage.createReactionCollector({
                            filter: (r, u) => !u.bot && r.emoji.name === emoji.name,
                            dispose: true // Detect when reaction is removed
                        });

                        assignCollector.on('collect', async (r, user) => {
                            const member = await message.guild.members.fetch(user.id);
                            if (member && !member.roles.cache.has(roleToAssign.id)) {
                                await member.roles.add(roleToAssign).catch(console.error);
                            }
                        });

                        assignCollector.on('remove', async (r, user) => {
                            const member = await message.guild.members.fetch(user.id);
                            if (member && member.roles.cache.has(roleToAssign.id)) {
                                await member.roles.remove(roleToAssign).catch(console.error);
                            }
                        });
                    } catch (err) {
                        console.error('Failed to send or react:', err);
                        await message.reply('Failed to send the message. Check bot permissions.');
                    }
                });

                roleCollector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        message.reply('You took too long to mention a role.');
                    }
                });
            });

            reactionCollector.on('end', (_, reason) => {
                if (reason === 'time') {
                    message.reply('You took too long to react with an emoji.');
                }
            });
        });

        collector1.on('end', (_, reason) => {
            if (reason === 'time') {
                message.reply('You took too long to respond. Please try again.');
            }

            try { prompt1.delete(); } catch {}
        });
    }
};