const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Create a support ticket.',
    async execute(message) {
        try {
            // Find the category named "Channels"
            const category = message.guild.channels.cache.find(
                (c) => c.name === "Channels" && c.type === ChannelType.GuildCategory
            );

            if (!category) {
                return message.channel.send("Error: Category 'Channels' not found. Please create it.");
            }

            // Check if a ticket already exists for the user
            const existingTicket = message.guild.channels.cache.find(
                (channel) => 
                    channel.name === `ticket-${message.author.username.toLowerCase()}` &&
                    channel.parentId === category.id
            );

            if (existingTicket) {
                return message.channel.send(`You already have an open ticket: ${existingTicket}.`);
            }

            // Create the ticket channel inside the "Channels" category
            const ticketChannel = await message.guild.channels.create({
                name: `ticket-${message.author.username.toLowerCase()}`,
                type: ChannelType.GuildText,
                parent: category.id, // Assign the parent category
                topic: `Support Ticket for ${message.author.username}`,
                permissionOverwrites: [
                    {
                        id: message.guild.id, // Deny @everyone from viewing
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: message.author.id, // Allow the user
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],
                    },
                    {
                        id: message.client.user.id, // Allow the bot
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.AddReactions,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],
                    },
                ],
            });

            console.log(`Ticket Channel Created: ${ticketChannel.name} in Category: ${category.name}`);

            // Create the ticket embed
            const embed = new EmbedBuilder()
                .setTitle('Support Ticket Created')
                .setDescription(
                    `Hello ${message.author.username}, how can we assist you today?\nReact with 🛑 to close this ticket.`
                )
                .setColor('#acf508');

            // Send the embed in the ticket channel
            const ticketMessage = await ticketChannel.send({ embeds: [embed] });

            // Add a reaction to the message
            await ticketMessage.react('🛑');

            // Notify the user
            message.channel.send(`Your ticket has been created: ${ticketChannel}. A staff member will assist you shortly!`);

        } catch (error) {
            console.error('Error creating ticket:', error);
            message.channel.send(`There was an error creating your ticket: ${error.message}`);
        }
    },
};