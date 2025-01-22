const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// Create Ticket Command
module.exports.createTicket = async (message) => {
    const user = message.author;
    const guild = message.guild;

    try {
        console.log(`[Ticket System] ${user.tag} requested to create a ticket.`);

        // Check if the user already has an open ticket
        const existingTicketChannel = guild.channels.cache.find(
            (channel) => channel.name === `ticket-${user.id}`
        );

        if (existingTicketChannel) {
            console.log(`[Ticket System] Ticket already exists for ${user.tag}.`);
            return await message.channel.send('You already have an open ticket!');
        }

        // Create a new text channel for the ticket
        console.log(`[Ticket System] Creating a ticket channel for ${user.tag}...`);

        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.id}`,
            type: 0, // Text channel (use '0' for compatibility with Discord.js v14 and above)
            topic: `Support Ticket for ${user.tag}`,
            parent: '1327875414584201349', // Your category ID
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionsBitField.Flags.ViewChannel], // Deny viewing for everyone
                },
                {
                    id: user.id, // Ticket creator
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
            ],
        });

        console.log(`[Ticket System] Ticket channel created: ${ticketChannel.name}`);

        // Send a message in the new ticket channel
        const embed = new EmbedBuilder()
            .setTitle('Ticket Created')
            .setDescription(`Hello ${user.tag}, your ticket has been created.\nPlease describe your issue or request below.`)
            .setColor('#1cd86c')
            .setFooter({ text: 'Ticket System' });

        await ticketChannel.send({ embeds: [embed] });

        // Notify the user in the original channel
        await message.channel.send(`Your ticket has been created! Please check ${ticketChannel} to provide more details.`);
    } catch (error) {
        console.error(`[Ticket System] Error creating ticket for ${user.tag}:`, error);
        await message.channel.send('There was an error creating your ticket. Please try again later.');
    }
};

// Close Ticket Command
module.exports.closeTicket = async (message) => {
    const user = message.author;
    const guild = message.guild;

    try {
        console.log(`[Ticket System] ${user.tag} requested to close a ticket.`);

        // Find the user's ticket channel
        const ticketChannel = guild.channels.cache.find(
            (channel) => channel.name === `ticket-${user.id}`
        );

        if (!ticketChannel) {
            console.log(`[Ticket System] No ticket found for ${user.tag}.`);
            return await message.channel.send('You do not have any open tickets.');
        }

        // Delete the ticket channel
        console.log(`[Ticket System] Closing ticket channel: ${ticketChannel.name} for ${user.tag}`);
        await ticketChannel.delete();

        // Notify the user in the original channel
        await message.channel.send(`Your ticket has been closed. Thank you for reaching out, ${user.tag}.`);
    } catch (error) {
        console.error(`[Ticket System] Error closing ticket for ${user.tag}:`, error);
        await message.channel.send('There was an error closing your ticket. Please try again later.');
    }
};