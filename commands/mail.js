require('dotenv').config();
const nodemailer = require('nodemailer');

const OWNER_EMAIL = process.env.OWNER_EMAIL;
const MOD_ROLE_NAME = 'Moderator';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

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
        const isMod = message.member.roles.cache.some(
            role => role.name.toLowerCase() === MOD_ROLE_NAME.toLowerCase()
        );
        if (!isMod) return message.reply('Only Moderators can use this command.');

        const askMessage = await message.reply('Please type your emergency message. You have 60 seconds.');

        const filter = m => m.author.id === message.author.id && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', async (msg) => {
            const content = msg.content.trim();
            if (!content) return msg.reply('Please provide a valid message to send.');

            const mailOptions = {
                from: `"Discord Mod Alert" <${GMAIL_USER}>`,
                to: OWNER_EMAIL,
                subject: `Emergency Message from Moderator ${msg.author.tag}`,
                text: `
Dear Admin,

You have received a new emergency message from a Discord Moderator.

Moderator: ${msg.author.tag} (ID: ${msg.author.id})
Server: ${msg.guild.name}
Channel: #${msg.channel.name}

Message:
----------
${content}
----------

Please take the necessary actions promptly.

Best regards,  
Discord Mod Alert Bot
                `.trim()
            };

            try {
                await transporter.sendMail(mailOptions);
                await msg.delete();
                await message.reply('Your emergency message has been sent successfully.');
            } catch (err) {
                console.error('Mail error:', err);
                await message.reply('Failed to send mail. Please contact the Owner directly.');
            }

            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.reply('You took too long to respond. Please try again.');
            }
            askMessage.delete();
        });
    },
};