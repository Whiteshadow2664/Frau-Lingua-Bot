const cron = require("node-cron");
const { EmbedBuilder } = require("discord.js");

const FESTIVAL_CHANNEL = "1443874625091010697"; // new channel ID

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

// Utility: Approximate Diwali (Kartika Amavasya)
function getDiwaliDate(year) {
    // Approximate: new moon in October/November
    let start = new Date(year, 9, 20); // Oct 20
    let end = new Date(year, 10, 20);  // Nov 20
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0) continue; // crude check: skip Sundays
        // Ideally, precise lunar calculation needed; using placeholder approximate
        if (d.getDate() % 5 === 0) return new Date(d);
    }
    return new Date(year, 10, 4); // fallback
}

// All festivals
function getFestivalData() {
    return {
        "01-01": {
            title: "🎉 Happy New Year!",
            message: "Wishing everyone a year filled with success, joy, and new beginnings.",
            img: "./images/1.jpg"
        },"11-28": {
    title: "🤖 Bot Testing!",
    message: "Today we celebrate our amazing bot features and testing day. Wishing smooth performance and happy coding!",
    img: "./images/13.jpg"
},
        "12-25": {
            title: "🎄 Merry Christmas!",
            message: "Warm wishes of joy, peace, and harmony to everyone celebrating today.",
            img: "./images/2.jpg"
        },
        "06-05": {
            title: "🌿 World Environment Day",
            message: "A greener and cleaner future begins with each one of us.",
            img: "./images/3.jpg"
        },
        "04-22": {
            title: "🌱 Earth Day",
            message: "Let’s come together to protect, preserve, and appreciate our beautiful planet.",
            img: "./images/4.jpg"
        },
        "04-07": {
            title: "🌍 World Health Day",
            message: "Your health is your most valuable asset—take care, stay strong, and live well.",
            img: "./images/5.jpg"
        },
        "02-14": {
            title: "❤️ Happy Valentine’s Day!",
            message: "May your day be filled with love, kindness, and meaningful connections.",
            img: "./images/6.jpg"
        },
        "06-21": {
            title: "👨‍🦱 International Men's Day",
            message: "Celebrating the achievements, contributions, and well-being of men everywhere.",
            img: "./images/7.jpg"
        },
        "03-08": {
            title: "🌸 International Women's Day",
            message: "Celebrating the strength, achievements, and contributions of women worldwide.",
            img: "./images/8.jpg"
        },
        "11-12": {
            title: "🪔 Diwali",
            message: "Wishing everyone light, positivity, and endless happiness.",
            img: "./images/9.jpg"
        },
        "EASTER": {
            title: "✝️ Happy Easter!",
            message: "Wishing joy, renewal, and hope on this Easter Sunday.",
            img: "./images/10.jpg"
        },
        "THANKSGIVING": {
            title: "🦃 Happy Thanksgiving!",
            message: "Warm wishes of gratitude, togetherness, and joy to everyone in our community.",
            img: "./images/11.jpg"
        },
        "10-31": {
            title: "🎃 Happy Halloween!",
            message: "Wishing everyone a fun, exciting, and spooky Halloween night!",
            img: "./images/12.jpg"
        }
    };
}

module.exports = (client) => {
    cron.schedule(
        "11 15 * * *", // runs daily at 09:00 IST
        async () => {
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

            // Dynamic: Easter
            const easter = getEasterDate(year);
            const easterKey = `${String(easter.getMonth() + 1).padStart(2, "0")}-${String(easter.getDate()).padStart(2, "0")}`;
            if (todayKey === easterKey) festival = festivals["EASTER"];

            // Dynamic: Diwali
            const diwali = getDiwaliDate(year);
            const diwaliKey = `${String(diwali.getMonth() + 1).padStart(2, "0")}-${String(diwali.getDate()).padStart(2, "0")}`;
            if (todayKey === diwaliKey) festival = festivals["11-12"]; // Diwali image

            if (!festival) return;

            try {
                const channel = await client.channels.fetch(FESTIVAL_CHANNEL);

                const embed = new EmbedBuilder()
                    .setTitle(festival.title)
                    .setDescription(festival.message)
                    .setImage(festival.img)
                    .setColor("#acf508")
                    .setTimestamp();

                const msg = await channel.send({
                    content: "@everyone",
                    embeds: [embed]
                });

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