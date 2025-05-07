const nodemailer = require('nodemailer'); 

const OWNER_EMAIL = 'chrisimakisasha01@gmail.com'; // Replace with your email
const MOD_ROLE_NAME = 'Moderator'; // Role name (case-insensitive)
const GMAIL_USER = 'sjemma819@gmail.com'; // Same as OWNER_EMAIL
const GMAIL_PASS = 'ucbuawatwscrmqrx'; // Use Gmail App Password (not regular password) 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
}); 

module.exports = {
    name: 'mail',
    description: 'Send an emergency message to the Owner\'s Gmail.',
    async execute(message) {
        // Check if sender has Moderator role
const isMod = message.member.roles.cache.some(
    role => role.name.toLowerCase() === MOD_ROLE_NAME.toLowerCase()
);
if (!isMod) return message.reply('Only Moderators can use this command.');

        // Ask the moderator for the message
        const askMessage = await message.reply('Please send your emergency message.'); 

        // Create a message collector to collect the moderator's response
        const filter = m => m.author.id === message.author.id && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 60000 }); 

        collector.on('collect', async (msg) => {
            const content = msg.content.trim(); 

            if (!content) {
                return msg.reply('Please provide a valid message to send.');
            } 

            // Create mail options
            const mailOptions = {
                from: `"Discord Mod Alert" <${GMAIL_USER}>`,
                to: OWNER_EMAIL,
                subject: `Emergency Mail from ${msg.author.tag}`,
                text: content,
            }; 

            try {
                // Send the email
                await transporter.sendMail(mailOptions); 

                // Delete the Moderator's message after sending the email
                await msg.delete(); 

                // Notify the moderator that the email was sent
                await message.reply('Your emergency message has been sent to the Owner’s Gmail.'); 

            } catch (err) {
                console.error('Mail error:', err);
                await message.reply('Failed to send mail. Please contact the Owner directly.');
            } 

            // Stop the collector after sending the email
            collector.stop();
        }); 

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.reply('You took too long to respond. Please try again.');
            } 

            // Delete the initial ask message after the collection ends
            askMessage.delete();
        });
    },
}