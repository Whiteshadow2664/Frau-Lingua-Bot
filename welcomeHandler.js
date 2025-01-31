const { EmbedBuilder } = require('discord.js');

// Function to handle member joins
const handleMemberJoin = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Send a message in the "welcome" channel mentioning the user
    const channel = guild.channels.cache.find(ch => ch.name === 'welcome');
    if (channel) {
        await channel.send('Welcome to **LinguaLounge**, <@${member.id}>! We are excited to have you join our community. You are now member **#${memberCount}**. Enjoy your time here!`);
    }
};

// Function to handle member leaves
const handleMemberLeave = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Send a leave message mentioning the user and showing the updated member count
    const channel = guild.channels.cache.find(ch => ch.name === 'welcome');
    if (channel) {
        await channel.send(`We're sorry to see you go, **${member.user.username}**. You will be missed. We now have **${memberCount}** members in **LinguaLounge**.`);
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};