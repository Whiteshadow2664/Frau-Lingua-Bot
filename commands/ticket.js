const { Permissions } = require('discord.js');

module.exports = {
    async createTicket(interaction) {
        const guild = interaction.guild;
        const member = interaction.member;

        // Create a new channel for the ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${member.user.username}`,
            type: 0, // 0 is the type for text channels
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id, // Deny access to everyone
                    deny: ['ViewChannel'],
                },
                {
                    id: member.id, // Allow access to the ticket creator
                    allow: ['ViewChannel', 'SendMessages'],
                },
            ],
        });

        await ticketChannel.send(`Hello ${member}, how can we assist you today?`);

        // Reply to the interaction with the ticket link
        await interaction.reply({
            content: `Ticket created: ${ticketChannel}`,
            ephemeral: true, // Private reply
        });

        // Start the timer to check for inactivity
        setTimeout(async () => {
            const moderatorRole = guild.roles.cache.find(role => role.name === 'moderator'); // Replace with your actual moderator role name
            if (!moderatorRole) {
                console.error('Moderator role not found');
                return;
            }

            // Check if the ticket channel still has no messages or activity
            const ticketMessages = await ticketChannel.messages.fetch({ limit: 1 }); // Check if there are any messages
            if (ticketMessages.size === 0) {
                // No messages after 10 minutes, ping the moderator
                await ticketChannel.send(`@${moderatorRole.name}, the user ${member.user.tag} has not been assisted yet. Please check the ticket!`);
            }
        }, 600000); // 10 minutes in milliseconds (600000ms)
    },

    async closeTicket(interaction) {
        const ticketChannel = interaction.channel;

        // Check if the channel is a ticket
        if (ticketChannel.name.startsWith('ticket-')) {
            await ticketChannel.delete();
            await interaction.reply({ content: 'Your ticket has been closed.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'This is not a valid ticket channel.', ephemeral: true });
        }
    }
};