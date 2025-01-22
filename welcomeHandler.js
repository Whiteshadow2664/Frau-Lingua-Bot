const { Client, GatewayIntentBits } = require('discord.js');

// Function to handle member joins
const handleMemberJoin = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Get the user's profile picture URL (small and rectangular)
    const profilePicture = member.user.displayAvatarURL({ dynamic: true, size: 128 }); // Size: 128px (small, rectangular format)

    // Send a regular message mentioning the user and showing their profile picture
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        await channel.send(`Hello <@${member.id}>, welcome to the server! You are member **#${memberCount}**!`);
        await channel.send({ content: '', files: [profilePicture] }); // Profile picture (rectangular size)
    } else {
        console.error("Channel not found: 'general'");
    }
};

// Function to handle member leaves
const handleMemberLeave = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Send a message mentioning the user and showing the updated member count
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        await channel.send(`${member.user.username} has left the server. We now have **${memberCount}** members.`);
    } else {
        console.error("Channel not found: 'general'");
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};