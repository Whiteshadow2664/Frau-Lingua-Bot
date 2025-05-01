const { TextChannel, EmbedBuilder, PermissionsBitField } = require('discord.js');

// Retry sending message with error handling
async function sendMessageWithRetry(channel, content, retries = 3) {
    try {
        if (channel && channel.viewable && channel.sendable) {
            await channel.send(content);
        }
    } catch (error) {
        if (error.status === 503 && retries > 0) {
            console.warn('Discord service unavailable, retrying in 5 seconds...');
            setTimeout(() => sendMessageWithRetry(channel, content, retries - 1), 5000);
        } else {
            console.error('Failed to send message:', error);
        }
    }
}

// Handle member join
const handleMemberJoin = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    const channel = guild.channels.cache.find(ch =>
        ch.name === 'welcome' &&
        ch instanceof TextChannel &&
        ch.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)
    );

    if (channel) {
        const welcomeMessage = `Welcome to **LinguaLounge**, <@${member.id}>!  
We're delighted to have you join our community.  
You are member **#${memberCount}** — enjoy your stay and feel free to introduce yourself!`;
        await sendMessageWithRetry(channel, welcomeMessage);
    }
};

// Handle member leave
const handleMemberLeave = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    const channel = guild.channels.cache.find(ch =>
        ch.name === 'welcome' &&
        ch instanceof TextChannel &&
        ch.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)
    );

    const username = member.user?.username || 'A member';

    if (channel) {
        const leaveMessage = `${username} has left **LinguaLounge**.  
We now have **${memberCount}** members. We wish them all the best.`;
        await sendMessageWithRetry(channel, leaveMessage);
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};