const { EmbedBuilder } = require('discord.js');

// Function to handle member joins
const handleMemberJoin = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Embed for member join
    const welcomeEmbed = new EmbedBuilder()
        .setTitle('Welcome to the Server!')
        .setDescription(`Hello ${member.user.tag}, welcome to the server! You are member **#${memberCount}**.`)
        .setColor('#1cd86c');

    // Send to a specific channel (e.g., 'general')
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        await channel.send({ embeds: [welcomeEmbed] });
    } else {
        console.error("Channel not found: 'general'");
    }
};

// Function to handle member leaves
const handleMemberLeave = async (member) => {
    const guild = member.guild;
    const memberCount = guild.memberCount;

    // Embed for member leave
    const leaveEmbed = new EmbedBuilder()
        .setTitle('Goodbye!')
        .setDescription(`${member.user.tag} has left the server. We now have **${memberCount}** members.`)
        .setColor('#ff4c4c');

    // Send to a specific channel (e.g., 'general')
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        await channel.send({ embeds: [leaveEmbed] });
    } else {
        console.error("Channel not found: 'general'");
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};