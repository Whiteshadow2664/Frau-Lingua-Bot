const { EmbedBuilder } = require('discord.js');

// This will be the function to handle new member joins and member leaves
const handleMemberJoin = async (client, member) => {
    const guild = member.guild;

    // Get the total member count
    const memberCount = guild.memberCount;

    // Check if the member is the 100th member
    if (memberCount === 100) {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎉 100th Member Alert! 🎉')
            .setDescription(`Welcome ${member.user.tag}, you are the **100th member** of the server! 🎉`)
            .setColor('#1cd86c');

        // Send the welcome message to a specific channel, replace 'general' with your channel name or ID
        const channel = guild.channels.cache.find(ch => ch.name === 'general');
        if (channel) {
            await channel.send({ embeds: [welcomeEmbed] });
        }
    } else {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member.user.tag}, welcome to the server! We're glad to have you!`)
            .setColor('#1cd86c');

        // Send the general welcome message to the 'general' channel
        const channel = guild.channels.cache.find(ch => ch.name === 'general');
        if (channel) {
            await channel.send({ embeds: [welcomeEmbed] });
        }
    }
};

const handleMemberLeave = async (client, member) => {
    const guild = member.guild;

    // Get the updated member count
    const memberCount = guild.memberCount;

    // Send a message when a member leaves
    const leaveEmbed = new EmbedBuilder()
        .setTitle('Goodbye!')
        .setDescription(`${member.user.tag} has left the server. We now have **${memberCount}** members.`)
        .setColor('#ff4c4c');

    // Send the message to the 'general' channel
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
        await channel.send({ embeds: [leaveEmbed] });
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};