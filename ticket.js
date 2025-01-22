const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ticketSystem = {
    async execute(message) {
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
        const filter = (interaction) => interaction.customId === 'create_ticket' && interaction.user.id === message.author.id;

        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            // Create a ticket channel
            const ticketChannel = await message.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: 0, // Guild text channel
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id, // Deny access to everyone
                        deny: ['ViewChannel'],
                    },
                    {
                        id: interaction.user.id, // Allow access to the user
                        allow: ['ViewChannel', 'SendMessages'],
                    },
                ],
            });

            // Send a confirmation message in the ticket channel
            const ticketCreatedEmbed = new EmbedBuilder()
                .setTitle('Ticket Created')
                .setDescription('A support member will assist you shortly.')
                .setColor('#FFD700');

            ticketChannel.send({ embeds: [ticketCreatedEmbed] });
            await interaction.reply({ content: 'Your ticket has been created!', ephemeral: true });
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                sentMessage.edit({ components: [] }); // Disable the button after timeout
                message.channel.send('Ticket creation timed out.');
            }
        });
    },
};

module.exports = ticketSystem;