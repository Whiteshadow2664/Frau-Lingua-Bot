const { EmbedBuilder } = require('discord.js');

// Create Ticket Command
module.exports.createTicket = async (message) => {
    const user = message.author;
    const guild = message.guild;

    // Log when the command is triggered
    console.log(`${user.tag} requested a ticket`);

    // Check if the user already has an open ticket
    const existingTicketChannel = guild.channels.cache.find(
        (channel) => channel.name === `ticket-${user.id}`
    );

    if (existingTicketChannel) {
        console.log('Ticket already exists for this user.');
        return message.channel.send('You already have an open ticket!');
    }

    try {
        // Log before creating the ticket channel
        console.log('Creating a new ticket channel...');
        
        // Create a new text channel for the ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.id}`,
            type: 'GUILD_TEXT',
            topic: `Ticket for ${user.tag}`,
            parent: '1327875414584201349', // Set the category ID where tickets will be created
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ['ViewChannel'],  // Deny @everyone from viewing the ticket
                },
                {
                    id: user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],  // Give the user permissions to interact with the ticket
                },
            ],
        });

        // Log after creating the channel
        console.log('Ticket channel created:', ticketChannel.name);

        // Send a message in the new ticket channel
        const embed = new EmbedBuilder()
            .setTitle('Ticket Created')
            .setDescription(`Hello ${user.tag}, your ticket has been created.\nPlease describe your issue or request.`)
            .setColor('#1cd86c')
            .setFooter({ text: 'Ticket System' });

        await ticketChannel.send({ embeds: [embed] });
        message.channel.send(`Your ticket has been created! Go to ${ticketChannel} to provide more details.`);
    } catch (error) {
        console.error('Error creating ticket:', error);
        message.channel.send('There was an error creating your ticket. Please try again later.');
    }
};

// Close Ticket Command
module.exports.closeTicket = async (message) => {
    const user = message.author;
    const guild = message.guild;

    // Log when the command is triggered
    console.log(`${user.tag} requested to close a ticket`);

    // Find the ticket channel for the user
    const ticketChannel = guild.channels.cache.find(
        (channel) => channel.name === `ticket-${user.id}`
    );

    if (!ticketChannel) {
        console.log('No ticket found for this user.');
        return message.channel.send('You do not have any open tickets.');
    }

    try {
        // Log before deleting the ticket channel
        console.log('Closing the ticket channel...');

        // Close the ticket by deleting the channel
        await ticketChannel.delete();
        message.channel.send(`The ticket has been closed. Thank you for reaching out, ${user.tag}.`);
    } catch (error) {
        console.error('Error closing ticket:', error);
        message.channel.send('There was an error closing your ticket. Please try again later.');
    }
};