// commands/ticket.js
const { EmbedBuilder } = require('discord.js');

// Ticket Command: Create a ticket
async function createTicket(message) {
    // Check if the user already has an open ticket
    const existingTicket = message.guild.channels.cache.find(
        (channel) => channel.name === `ticket-${message.author.id}`
    );

    if (existingTicket) {
        return message.channel.send('You already have an open ticket!');
    }

    // Create the ticket channel
    try {
        const ticketChannel = await message.guild.channels.create(`ticket-${message.author.id}`, {
            type: 'text',
            topic: `Ticket for ${message.author.tag}`,
            permissionOverwrites: [
                {
                    id: message.guild.id, // Deny everyone permission to view the channel
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: message.author.id, // Allow the user to view and send messages in the channel
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                },
                {
                    id: '1330222964985303172', // Support role ID
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                },
            ],
        });

        // Send an initial message in the ticket channel
        await ticketChannel.send(
            `Hello ${message.author.tag}, how can we assist you? Please describe your issue here. A staff member will respond soon.`
        );

        // Notify the user about the ticket creation
        message.channel.send(`Your ticket has been created! Check <#${ticketChannel.id}> to describe your issue.`);
    } catch (error) {
        console.error('Error creating ticket channel:', error);
        return message.channel.send('There was an error creating the ticket. Please try again later.');
    }
}

// Ticket Command: Close a ticket
async function closeTicket(message) {
    // Ensure the user is either the ticket owner or a staff member
    if (message.author.id !== message.channel.name.split('-')[1] && !message.member.roles.cache.has('1330222964985303172')) {
        return message.channel.send('You are not authorized to close this ticket.');
    }

    // Close the ticket by deleting the channel
    try {
        await message.channel.send('Closing the ticket...');
        await message.channel.delete();
    } catch (error) {
        console.error('Error closing ticket channel:', error);
        return message.channel.send('There was an error closing the ticket. Please try again later.');
    }
}

module.exports = {
    createTicket,
    closeTicket,
};