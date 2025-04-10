const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    // Schedule the task to run 5 minutes (300,000 milliseconds) after the bot is ready
    setTimeout(async () => {
        const usernameToBan = 'username#discriminator'; // Replace with the username and discriminator of the user to ban
        const channelName = 'general'; // The name of the channel

        try {
            // Iterate over all guilds the bot is a member of
            for (const guild of client.guilds.cache.values()) {
                // Fetch the user by username and discriminator
                const user = guild.members.cache.find(member => member.user.tag === usernameToBan)?.user;

                if (user) {
                    // Ban the user
                    await guild.members.ban(user, { reason: 'Unauthorized promotion of another server' });

                    // Find the #general channel by name
                    const channel = guild.channels.cache.find(ch => ch.name === channelName && ch.isTextBased());

                    if (channel) {
                        // Create the embed message
                        const embed = new EmbedBuilder()
                            .setColor('#acf508')
                            .setTitle('User Banned')
                            .setDescription(`**${user.tag}** has been banned.`)
                            .addFields(
                                { name: 'User ID', value: user.id },
                                { name: 'Reason', value: 'You attempted to promote your non-language learning server by misleading members into thinking they would learn German. This behavior is unacceptable. Promoting servers without moderator permission will result in a ban.' }
                            )
                            .setTimestamp();

                        // Send the embed message in the #general channel
                        await channel.send({ content: `<@${user.id}>`, embeds: [embed] });

                        console.log(`Banned ${user.tag} and sent embed message in #general.`);
                    } else {
                        console.log(`Channel #${channelName} not found in guild ${guild.name}.`);
                    }
                } else {
                    console.log(`User ${usernameToBan} not found in guild ${guild.name}.`);
                }
            }
        } catch (error) {
            console.error('Error executing scheduled ban and message:', error);
        }
    }, 300000); // 300,000 ms = 5 minutes
};