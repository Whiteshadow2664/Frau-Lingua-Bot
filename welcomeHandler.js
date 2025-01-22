const { EmbedBuilder } = require('discord.js');

const handleMemberJoin = async (client, member) => {
    const guild = member.guild;

    try {
        // Fetch the updated member count
        const memberCount = guild.memberCount;

        // Embed message for member joining
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member.user.tag}, you are member number **${memberCount}** of this server! 🎉 We're excited to have you here!`)
            .setColor('#1cd86c');

        // Send the embed to the appropriate channel
        const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.name === 'general' && ch.isText());
        if (channel) {
            await channel.send({ embeds: [welcomeEmbed] });
        } else {
            console.log('No valid channel found to send the welcome message.');
        }
    } catch (error) {
        console.error('Error handling member join:', error);
    }
};

const handleMemberLeave = async (client, member) => {
    const guild = member.guild;

    try {
        // Fetch the updated member count
        const memberCount = guild.memberCount;

        // Embed message for member leaving
        const leaveEmbed = new EmbedBuilder()
            .setTitle('Goodbye!')
            .setDescription(`${member.user.tag} has left the server. We now have **${memberCount}** members remaining.`)
            .setColor('#ff4c4c');

        // Send the embed to the appropriate channel
        const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.name === 'general' && ch.isText());
        if (channel) {
            await channel.send({ embeds: [leaveEmbed] });
        } else {
            console.log('No valid channel found to send the goodbye message.');
        }
    } catch (error) {
        console.error('Error handling member leave:', error);
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};