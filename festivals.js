const fs = require("fs");
const path = require("path"); // for AttachmentBuilder if you want
const LOCK_FILE = "./festival.lock"; // lock file to prevent multiple sends
const cron = require("node-cron");
const { AttachmentBuilder } = require("discord.js");

const FESTIVAL_CHANNEL = "1279821768785137686"; // new channel ID

// Utility: Calculate 4th Thursday of November (Thanksgiving)
function getThanksgivingDate(year) {
    let date = new Date(year, 10, 1); // November 1
    let thursdayCount = 0;

    while (true) {
        if (date.getDay() === 4) thursdayCount++;
        if (thursdayCount === 4) break;
        date.setDate(date.getDate() + 1);
    }

    return date;
}

// Utility: Approximate Easter Sunday (Western)
function getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
}

// Utility: Calculate 2nd Sunday of May (Mother's Day)
function getMothersDayDate(year) {
    let date = new Date(year, 4, 1); // May 1 (month is 0-based)
    let sundayCount = 0;

    while (true) {
        if (date.getDay() === 0) sundayCount++; // Sunday = 0
        if (sundayCount === 2) break; // second Sunday
        date.setDate(date.getDate() + 1);
    }

    return date;
}

// All festivals
function getFestivalData() {
    return {
        "12-01": {
            title: "# HAPPY NEW YEAR! 🎉 #",
            message: "Wishing everyone a year filled with success, joy, and new beginnings.",
            img: "./images/1.jpg"
        },
        "12-25": {
            title: "# MERRY CHRISTMAS! 🎄 #",
            message: "Warm wishes of joy, peace, and harmony to everyone celebrating today.",
            img: "./images/2.jpg"
        },
"MOTHERSDAY": {
    title: "# HAPPY MOTHER'S DAY! 💜 #",
    message: "Happy Mother's Day to all the amazing moms in the server! We celebrate the endless love and dedication you bring every day.",
    img: "./images/15.jpg"
},
        "06-21": {
            title: "# INTERNATIONAL MEN'S DAY! #",
            message: "Celebrating the achievements, contributions, and well-being of men everywhere.",
            img: "./images/7.jpg"
        },
        "03-08": {
            title: "# INTERNATIONAL WOMEN'S DAY! #",
            message: "Celebrating the strength, achievements, and contributions of women worldwide.",
            img: "./images/8.jpg"
        },
        "11-12": {
            title: "# HAPPY DIWALI! #",
            message: "Wishing everyone light, positivity, and endless happiness.",
            img: "./images/9.jpg"
        },
        "EASTER": {
            title: "# HAPPY EASTER! #",
            message: "Wishing joy, renewal, and hope on this Easter Sunday.",
            img: "./images/10.jpg"
        },
        "THANKSGIVING": {
            title: "# HAPPY THANKSGIVING DAY! #",
            message: "Warm wishes of gratitude, togetherness, and joy to everyone in our community.",
            img: "./images/11.jpg"
        },
        "10-31": {
            title: "# HAPPY HALLOWEEN! 🎃 #",
            message: "Wishing everyone a fun, exciting, and spooky Halloween night!",
            img: "./images/12.jpg"
        }
    };
}

module.exports = (client) => {
    cron.schedule(
        "30 06 * * *", // runs daily at 06:30 IST
        async () => {
            const todayFull = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// Check if we already sent the festival today
if (fs.existsSync(LOCK_FILE)) {
    const lastDate = fs.readFileSync(LOCK_FILE, "utf8");
    if (lastDate === todayFull) return; // Already sent today
}

// Now calculate todayKey for selecting festival
const today = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "2-digit",
    day: "2-digit"
});
const [day, month] = today.split("/");
const todayKey = `${month}-${day}`;

            const festivals = getFestivalData();
            let festival = festivals[todayKey];

            const year = new Date().getFullYear();

            // Dynamic: Thanksgiving
            const thanksgiving = getThanksgivingDate(year);
            const thanksKey = `${String(thanksgiving.getMonth() + 1).padStart(2, "0")}-${String(
                thanksgiving.getDate()
            ).padStart(2, "0")}`;
            if (todayKey === thanksKey) festival = festivals["THANKSGIVING"];

// Dynamic: Mother's Day
const mothersDay = getMothersDayDate(year);
const mothersDayKey = `${String(mothersDay.getMonth() + 1).padStart(2, "0")}-${String(mothersDay.getDate()).padStart(2, "0")}`;
if (todayKey === mothersDayKey) festival = festivals["MOTHERSDAY"];

            // Dynamic: Easter
            const easter = getEasterDate(year);
            const easterKey = `${String(easter.getMonth() + 1).padStart(2, "0")}-${String(easter.getDate()).padStart(2, "0")}`;
            if (todayKey === easterKey) festival = festivals["EASTER"];

            // Fixed Diwali dates for next 30 years
const DIWALI_DATES = {
    2025: "11-01",
    2026: "11-08",
    2027: "10-30",
    2028: "10-18",
    2029: "11-06",
    2030: "10-26",
    2031: "11-14",
    2032: "11-03",
    2033: "10-24",
    2034: "11-12",
    2035: "11-01",
    2036: "10-20",
    2037: "11-09",
    2038: "10-29",
    2039: "10-18",
    2040: "11-06",
    2041: "10-27",
    2042: "11-15",
    2043: "11-04",
    2044: "10-23",
    2045: "11-12",
    2046: "11-01",
    2047: "10-21",
    2048: "11-09",
    2049: "10-30",
    2050: "10-19",
    2051: "11-07",
    2052: "10-26",
    2053: "11-15",
    2054: "11-04",
};

if (DIWALI_DATES[year] === todayKey) {
    festival = festivals["11-12"];
}

            if (!festival) return;

            try {
                const channel = await client.channels.fetch(FESTIVAL_CHANNEL);

                // Create an attachment for the local image
const attachment = new AttachmentBuilder(path.resolve(__dirname, festival.img));

const msg = await channel.send({
    content: `@everyone\n\n${festival.title}\n\n${festival.message}`,
    files: [attachment]
});

// Mark that festival has been sent today
fs.writeFileSync(LOCK_FILE, todayFull);

                // Auto reactions
                const celebrationEmojis = ["🎉","✨","💛","🎊","🥳"];
                const flagEmojis = ["🇩🇪","🇷🇺","🇫🇷","🇮🇳","🇺🇸","🇬🇧","🇮🇹","🇦🇺","🇳🇿","🇪🇸","🇦🇹"];
                for (const emoji of [...celebrationEmojis, ...flagEmojis]) {
                    await msg.react(emoji).catch(() => {});
                }
                
console.log(`🎉 Festival message sent: ${festival.title}`);
            } catch (err) {
                console.error("❌ Festival message error:", err);
            }
        },
        { timezone: "Asia/Kolkata" }
    );
};