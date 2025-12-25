const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

const FESTIVAL_CHANNEL = "1279821768785137686"; // new channel ID
const LOCK_FILE = "./festival.lock";

// Utility: Calculate 4th Thursday of November (Thanksgiving)
function getThanksgivingDate(year) {
    let date = new Date(year, 10, 1);
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
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(H / 28) * f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
}

// All festivals
function getFestivalData() {
    return {
        "01-01": { title: "🎉 Happy New Year!", message: "Wishing everyone a year filled with success, joy, and new beginnings.", img: "./images/1.jpg" },
        "12-25": { title: "🎄 Merry Christmas!", message: "Warm wishes of joy, peace, and harmony to everyone celebrating today.", img: "./images/2.jpg" },
        "05-10": { title: "💜 HAPPY MOTHER'S DAY", message: "Happy Mother's Day to all the amazing moms in the server! We celebrate the endless love and dedication you bring every day.", img: "./images/15.jpg" },
        "06-21": { title: "👨‍🦱 International Men's Day", message: "Celebrating the achievements, contributions, and well-being of men everywhere.", img: "./images/7.jpg" },
        "03-08": { title: "🌸 International Women's Day", message: "Celebrating the strength, achievements, and contributions of women worldwide.", img: "./images/8.jpg" },
        "11-12": { title: "🪔 Diwali", message: "Wishing everyone light, positivity, and endless happiness.", img: "./images/9.jpg" },
        "EASTER": { title: "✝️ Happy Easter!", message: "Wishing joy, renewal, and hope on this Easter Sunday.", img: "./images/10.jpg" },
        "THANKSGIVING": { title: "🦃 Happy Thanksgiving!", message: "Warm wishes of gratitude, togetherness, and joy to everyone in our community.", img: "./images/11.jpg" },
        "10-31": { title: "🎃 Happy Halloween!", message: "Wishing everyone a fun, exciting, and spooky Halloween night!", img: "./images/12.jpg" }
    };
}

module.exports = (client) => {
    cron.schedule("35 12 * * *", async () => { // runs daily at 12:35 IST
        const todayFull = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

        // Prevent sending more than once per day
        if (fs.existsSync(LOCK_FILE)) {
            const lastDate = fs.readFileSync(LOCK_FILE, "utf8");
            if (lastDate === todayFull) return;
        }

        const today = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "2-digit", day: "2-digit" });
        const [day, month] = today.split("/");
        const todayKey = `${month}-${day}`;

        const festivals = getFestivalData();
        let festival = festivals[todayKey];

        const year = new Date().getFullYear();

        // Dynamic festivals
        const thanksgiving = getThanksgivingDate(year);
        const thanksKey = `${String(thanksgiving.getMonth() + 1).padStart(2, "0")}-${String(thanksgiving.getDate()).padStart(2, "0")}`;
        if (todayKey === thanksKey) festival = festivals["THANKSGIVING"];

        const easter = getEasterDate(year);
        const easterKey = `${String(easter.getMonth() + 1).padStart(2, "0")}-${String(easter.getDate()).padStart(2, "0")}`;
        if (todayKey === easterKey) festival = festivals["EASTER"];

        if (!festival) return;

        try {
            const channel = await client.channels.fetch(FESTIVAL_CHANNEL);
            const attachment = new AttachmentBuilder(path.resolve(__dirname, festival.img));

            await channel.send({
                content: `@everyone\n\n${festival.title}\n\n${festival.message}`,
                files: [attachment]
            });

            // Optional: Auto reactions
            const emojis = ["🎉","✨","💛","🎊","🥳","🇩🇪","🇷🇺","🇫🇷","🇮🇳","🇺🇸","🇬🇧","🇮🇹","🇦🇺","🇳🇿","🇪🇸","🇦🇹"];
            const lastMsg = await channel.messages.fetch({ limit: 1 });
            const msg = lastMsg.first();
            for (const emoji of emojis) await msg.react(emoji).catch(() => {});

            fs.writeFileSync(LOCK_FILE, todayFull);
            console.log(`🎉 Festival message sent: ${festival.title}`);
        } catch (err) {
            console.error("❌ Festival message error:", err);
        }
    }, { timezone: "Asia/Kolkata" });
};