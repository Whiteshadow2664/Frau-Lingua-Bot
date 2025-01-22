const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ticket',
        description: 'Creates a support ticket',
    },
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setStyle('PRIMARY')
        );

        await interaction.reply({
            content: 'Click the button below to create a support ticket.',
            components: [row],
            ephemeral: true, // Only the user can see this message
        });
    },
};