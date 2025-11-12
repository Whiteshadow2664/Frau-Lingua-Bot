const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

// ✅ Database connection (same as leaderboard.js)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// 🎂 Cache birthdays before writing to DB
const birthdayCache = new Map();

// 🎂 Ensure table exists
async function ensureTableExists() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS birthdays (
                user_id TEXT PRIMARY KEY,
                birthdate TEXT NOT NULL
            )
        `);
        console.log("✅ Birthday table verified/created.");
    } catch (err) {
        console.error("❌ Error ensuring birthday table exists:", err);
    } finally {
        client.release();
    }
}
ensureTableExists();

// 🎉 Random birthday wishes
const birthdayMessages = [
    "Wishing you a fantastic birthday filled with joy and success, <@{user}>! 🎉",
    "Happy Birthday <@{user}>! May your day be as amazing as you are. 🎂",
    "Cheers to you, <@{user}>! Have a professional yet fun birthday celebration! 🥳",
    "May your birthday bring professional accomplishments and personal happiness, <@{user}>! 🎈",
    "🎊 Happy Birthday <@{user}>! Wishing you a remarkable year ahead. 🌟"
];

const reactionEmojis = ["🎉","🥳","🎂","🎈","🎁","✨"];

// 🕒 Save cached birthdays to database daily at 5:20 AM IST
cron.schedule('40 14 * * *', async () => {
    console.log(`📝 Saving cached birthdays at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}...`);
    if (birthdayCache.size === 0) {
        console.log("✅ No new birthdays to save.");
        return;
    }

    const client = await pool.connect();
    try {
        for (const [userId, birthdate] of birthdayCache.entries()) {
            await client.query(`
                INSERT INTO birthdays (user_id, birthdate)
                VALUES ($1, $2)
                ON CONFLICT (user_id)
                DO UPDATE SET birthdate = EXCLUDED.birthdate
            `, [userId, birthdate]);
        }
        birthdayCache.clear();
        console.log("✅ Birthday cache saved to database.");
    } catch (err) {
        console.error("❌ Error saving birthdays to database:", err);
    } finally {
        client.release();
    }
}, { timezone: "Asia/Kolkata" });

// 🎉 Check daily birthdays at 12:00 AM IST
cron.schedule('43 14 * * *', async () => {
    console.log("🎂 Checking birthdays...");
    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        timeZone: 'Asia/Kolkata',
    });

    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT user_id, birthdate FROM birthdays WHERE birthdate = $1`, [today]);
        if (res.rows.length === 0) {
            console.log("No birthdays today.");
            return;
        }

        const channel = await module.exports.clientDiscord.channels.fetch('1438049547573268536'); // replace with your channel ID

        for (const row of res.rows) {
            const member = await module.exports.clientDiscord.guilds.cache
                .first()
                .members.fetch(row.user_id)
                .catch(() => null);

            if (!member) continue;

            const randomMsg = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)]
                .replace('{user}', row.user_id);

            const embed = new EmbedBuilder()
                .setTitle("🎂 Happy Birthday!")
                .setDescription(randomMsg)
                .setColor("#FF69B4")
                .setFooter({ text: "You can add your birthday using !bday command" });

            const sentMessage = await channel.send({ embeds: [embed] });
            await sentMessage.react(reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)]);
        }

        console.log(`🎉 Wished ${res.rows.length} member(s) happy birthday (if present in server)!`);
    } catch (err) {
        console.error("❌ Error checking birthdays:", err);
    } finally {
        client.release();
    }
}, { timezone: "Asia/Kolkata" });

// 🎂 Command: !bday
module.exports.execute = async (message) => {
    if (!message.content.startsWith('!bday')) return;

    try {
        const filter = m => m.author.id === message.author.id;
        const promptMsg = await message.channel.send('🎂 Please enter your birth date (e.g., `05 December`):');
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
        if (!collected.size) {
            setTimeout(() => promptMsg.delete().catch(() => {}), 5000);
            return message.channel.send('⏰ You took too long to respond.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const birthdate = collected.first().content.trim();

        if (!/^\d{2}\s[A-Za-z]+$/.test(birthdate)) {
            const errorMsg = await message.channel.send('⚠️ Invalid format. Please use `DD Month`, e.g., `21 May`.');
            setTimeout(() => {
                promptMsg.delete().catch(() => {});
                collected.first().delete().catch(() => {});
                errorMsg.delete().catch(() => {});
            }, 5000);
            return;
        }

        birthdayCache.set(message.author.id, birthdate);
        const confirmMsg = await message.channel.send(`✅ Your birthday **${birthdate}** has been saved! 🎉`);

        // Delete all messages related to this command after 5 seconds
        setTimeout(() => {
            promptMsg.delete().catch(() => {});
            collected.first().delete().catch(() => {});
            confirmMsg.delete().catch(() => {});
        }, 5000);
    } catch (err) {
        console.error("❌ Error saving birthday:", err);
        message.channel.send("❌ Something went wrong. Please try again later.").then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
};