const { TextChannel, PermissionsBitField } = require('discord.js');

// Retry message sending with error handling
async function sendMessageWithRetry(channel, content, retries = 3) {
    try {
        if (channel && channel.viewable && channel.permissionsFor(channel.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            await channel.send(content);
        }
    } catch (error) {
        if (error.code === 50013) {
            console.error('Missing permissions to send message in channel:', channel.name);
        } else if (error.status === 503 && retries > 0) {
            console.warn('Discord service unavailable. Retrying in 5 seconds...');
            setTimeout(() => sendMessageWithRetry(channel, content, retries - 1), 5000);
        } else {
            console.error('Error sending message:', error);
        }
    }
}

// Handle member join
async function handleMemberJoin(member) {
    const guild = member.guild;
    const channel = guild.channels.cache.find(
        ch => ch.name === 'welcome' && ch instanceof TextChannel
    );

    if (!channel) return;

    const memberCount = guild.memberCount;
    const welcomeMessage = `Welcome to **LinguaLounge**, <@${member.id}>!  
We're excited to have you here. You are now member **#${memberCount}**.  
Feel free to introduce yourself and join the conversation!`;

    await sendMessageWithRetry(channel, welcomeMessage);
}

// Handle member leave
async function handleMemberLeave(member) {
    const guild = member.guild;
    const channel = guild.channels.cache.find(
        ch => ch.name === 'welcome' && ch instanceof TextChannel
    );

    if (!channel) return;

    const username = member.user?.username || 'A member';
    const memberCount = guild.memberCount;
    const leaveMessage = `**${username}** has left **LinguaLounge**.  
We now have **${memberCount}** members. We wish them the best on their journey.`;

    await sendMessageWithRetry(channel, leaveMessage);
}

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};