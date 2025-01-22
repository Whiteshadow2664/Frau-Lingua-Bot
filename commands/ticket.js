const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

const ticketSystem = {
    async execute(message) {
        try {
            // Create a ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setTitle('Support Ticket System')
                .setDescription('Click the button below to create a new support ticket.')
                .setColor('#00FF00');

            const ticketButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

            // Send the embed with the button
            const sentMessage = await message.channel.send({ embeds: [ticketEmbed], components: [ticketButton] });

            // Listen for button interactions
            const filter = (interaction) =>
                interaction.customId === 'create_ticket' && interaction.user.id === message.author.id;

            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                try {
                    // Check if the user already has a ticket
                    const existingChannel = message.guild.channels.cache.find(
                        (ch) => ch.name === `ticket-${interaction.user.username}`
                    );
                    if (existingChannel) {
                        await interaction.reply({
                            content: 'You already have an open ticket!',
                            flags: 64, // Ephemeral reply
                        });
                        return;
                    }

                    // Create a ticket channel
                    const ticketChannel = await message.guild.channels.create({
                        name: `ticket-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id, // Deny access to everyone
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: interaction.user.id, // Allow access to the user
                                allow: [
                                    PermissionsBitField.Flags.ViewChannel,
                                    PermissionsBitField.Flags.SendMessages,
                                ],
                            },
                        ],
                    });

                    // Send a confirmation message in the ticket channel
                    const ticketCreatedEmbed = new EmbedBuilder()
                        .setTitle('Ticket Created')
                        .setDescription('A support member will assist you shortly.')
                        .setColor('#FFD700');

                    await ticketChannel.send({ embeds: [ticketCreatedEmbed] });
                    await interaction.reply({
                        content: 'Your ticket has been created!',
                        flags: 64, // Ephemeral reply
                    });
                } catch (error) {
                    console.error('Error creating ticket:', error);
                    await interaction.reply({
                        content: 'An error occurred while creating your ticket.',
                        flags: 64, // Ephemeral reply
                    });
                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    sentMessage.edit({ components: [] }); // Disable the button after timeout
                    message.channel.send('Ticket creation timed out.');
                }
            });
        } catch (error) {
            console.error('Error executing ticket system:', error);
            message.channel.send('An error occurred while setting up the ticket system.');
        }
    },
};

// Command handler integration
module.exports = {
    execute: async (message, args) => {
        if (message.content.toLowerCase() === '!ticket') {
            try {
                await ticketSystem.execute(message);
                console.log('Ticket command executed.');
            } catch (error) {
                console.error('Error executing ticket command:', error);
                message.channel.send('An error occurred while handling the ticket command.');
            }
        }
    },
};

// Handling "!ticket" in the main bot script
if (message.content.toLowerCase() === '!ticket') {
    try {
        ticket.execute(message);
    } catch (error) {
        console.error('Error executing ticket command:', error);
        message.channel.send('An error occurred while handling the ticket command.');
    }
}

// Interaction example
interaction.reply({
    content: 'This is a reply.',
    flags: 64, // Ephemeral reply
});