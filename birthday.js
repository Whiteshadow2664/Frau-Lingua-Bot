// birthday.js
const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const cron = require('node-cron');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
});

// In-memory birthday cache: user_id -> birthday (Date)
const birthdayCache = new Map();

// Ensure birthdays table exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS birthdays (
        user_id TEXT PRIMARY KEY,
        birthday DATE NOT NULL
      );
    `);
  } catch (err) {
    console.error('Error creating birthdays table:', err);
  }
})();

// Handle user birthday input and update in cache
module.exports.handleSetBirthday = async (message) => {
  const filter = m => m.author.id === message.author.id;
  message.channel.send('Please enter your birthday in **DD/MM/YYYY** format (e.g., `17/04/2000`)');

  try {
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const input = collected.first().content.trim();
    const [day, month, year] = input.split('/');

    if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
      return message.channel.send('Invalid format. Please use `DD/MM/YYYY`.');
    }

    const birthday = new Date(`${year}-${month}-${day}`);
    if (isNaN(birthday)) return message.channel.send('Invalid date. Please try again.');

    birthdayCache.set(message.author.id, birthday);
    message.channel.send('Your birthday has been recorded and will be saved to the database soon.');
  } catch (err) {
    message.channel.send('No response received. Please try again later.');
  }
};

// Save birthday cache to database at 05:20 IST daily
cron.schedule('50 10 * * *', async () => {
  console.log('⏳ Saving birthday cache to database...');

  if (birthdayCache.size === 0) {
    console.log('✅ No birthdays to save.');
    return;
  }

  try {
    const client = await pool.connect();

    for (const [userId, birthday] of birthdayCache.entries()) {
      await client.query(
        `INSERT INTO birthdays (user_id, birthday)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET birthday = $2`,
        [userId, birthday]
      );
    }

    birthdayCache.clear();
    client.release();
    console.log('✅ Birthday data saved to database.');
  } catch (err) {
    console.error('❌ Error saving birthday data:', err);
  }
}, { timezone: 'Asia/Kolkata' });

// Send birthday wishes at 05:40 IST daily
cron.schedule('55 10 * * *', async () => {
  console.log('🎉 Checking for birthdays to celebrate...');

  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  try {
    const client = await pool.connect();

    const { rows } = await client.query(`
      SELECT user_id FROM birthdays
      WHERE TO_CHAR(birthday, 'MM-DD') = $1
    `, [todayMD]);

    client.release();

    if (rows.length === 0) {
      console.log('No birthdays today.');
      return;
    }

    const clientInstance = require('./index').client;
    const channelId = '1362292555102031987'; // Replace with your #general channel ID
    const channel = await clientInstance.channels.fetch(channelId);

    for (const row of rows) {
      await channel.send(`**Happy Birthday <@${row.user_id}>! Have a fantastic day!**`);
    }

    console.log(`✅ Birthday wishes sent to ${rows.length} users.`);
  } catch (err) {
    console.error('❌ Error sending birthday wishes:', err);
  }
}, { timezone: 'Asia/Kolkata' });