const { EmbedBuilder } = require('discord.js');

// Function to handle member join
const handleMemberJoin = async (client, member) => {
    const guild = member.guild;

    try {
        // Fetch the current member count
        const memberCount = guild.memberCount;

        // Log member count for debugging
        console.log(`New member joined: ${member.user.tag}, Total members: ${memberCount}`);

        // Create an embed for the welcome message
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member.user.tag}, you are member number **${memberCount}** of this server! 🎉`)
            .setColor('#1cd86c');

        // Find the channel to send the message
        const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.name === 'general' && ch.isText());
        if (channel) {
            console.log(`Sending welcome message to channel: ${channel.name}`);
            await channel.send({ embeds: [welcomeEmbed] });
        } else {
            console.error('No valid channel found to send the welcome message.');
        }
    } catch (error) {
        console.error('Error handling member join:', error);
    }
};

// Function to handle member leave
const handleMemberLeave = async (client, member) => {
    const guild = member.guild;

    try {
        // Fetch the updated member count
        const memberCount = guild.memberCount;

        // Log member count for debugging
        console.log(`Member left: ${member.user.tag}, Remaining members: ${memberCount}`);

        // Create an embed for the goodbye message
        const leaveEmbed = new EmbedBuilder()
            .setTitle('Goodbye!')
            .setDescription(`${member.user.tag} has left the server. We now have **${memberCount}** members remaining.`)
            .setColor('#ff4c4c');

        // Find the channel to send the message
        const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.name === 'general' && ch.isText());
        if (channel) {
            console.log(`Sending goodbye message to channel: ${channel.name}`);
            await channel.send({ embeds: [leaveEmbed] });
        } else {
            console.error('No valid channel found to send the goodbye message.');
        }
    } catch (error) {
        console.error('Error handling member leave:', error);
    }
};

module.exports = {
    handleMemberJoin,
    handleMemberLeave
};