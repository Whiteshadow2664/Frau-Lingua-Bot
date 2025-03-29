const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Check if the message is from Arcane bot
        if (message.author.id !== '437808476106784770') return;

        // Check if the message contains "has reached level 10"
        const levelUpMatch = message.content.match(/<@(\d+)> has reached level \*\*10\*\*\. GG!/);

        if (levelUpMatch) {
            const userId = levelUpMatch[1]; // Extract user ID from mention
            const guild = message.guild;
            const member = await guild.members.fetch(userId).catch(() => null);

            if (!member) return; // User might have left the server

            // Define the "Regulars" role
            const regularsRole = guild.roles.cache.find(role => role.name === 'Regulars');

            if (!regularsRole) {
                console.error('Regulars role not found!');
                return;
            }

            // Add the role to the user
            await member.roles.add(regularsRole).catch(console.error);

            // Send a congratulatory embed
            const congratsEmbed = new EmbedBuilder()
                .setColor(0xacf508) // Set color to #acf508
                .setTitle('Level Up Achieved!')
                .setDescription(`<@${userId}>, congratulations on reaching level **10**! 🎉 You've been granted the **Regulars** role.`)
                .setTimestamp();

            // Send the embed in the same channel where Arcane announced the level up
            await message.channel.send({ embeds: [congratsEmbed] });
        }
    });
};