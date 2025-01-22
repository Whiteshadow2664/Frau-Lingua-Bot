const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Creates a ticket for support.',
    async execute(message) {
        try {
            // Create the ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setTitle('Support Ticket')
                .setDescription('Click the button below to create a support ticket.')
                .setColor('#0099ff');

            // Create a button for ticket creation
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

            // Send the embed with the button
            await message.channel.send({
                embeds: [ticketEmbed],
                components: [row],
            });
        } catch (error) {
            console.error('Error executing ticket command:', error);
            await message.channel.send('An error occurred while creating the ticket.');
        }
    },
};