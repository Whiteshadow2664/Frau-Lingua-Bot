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

// All fixed-date festivals
function getFestivalData() {
    const year = new Date().getFullYear();
    const thanksgiving = getThanksgivingDate(year);

    return {
        "01-01": {
            title: "🎉 Happy New Year!",
            message: "Wishing everyone a year filled with success, joy, and new beginnings.",
            img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80"
        },
        "02-14": {
            title: "❤️ Happy Valentine’s Day!",
            message: "May your day be filled with love, kindness, and meaningful connections.",
            img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
        },
        "03-08": {
            title: "🌸 International Women's Day",
            message: "Celebrating the strength, achievements, and contributions of women worldwide.",
            img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80"
        },
        "04-07": {
            title: "🌍 World Health Day",
            message: "Your health is your most valuable asset—take care, stay strong, and live well.",
            img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80"
        },
        "04-22": {
            title: "🌱 Earth Day",
            message: "Let’s come together to protect, preserve, and appreciate our beautiful planet.",
            img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        },
        "06-05": {
            title: "🌿 World Environment Day",
            message: "A greener and cleaner future begins with each one of us.",
            img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
        },
        "06-21": {
            title: "🧘‍♂️ International Yoga Day",
            message: "Breathe deeply, relax fully, and embrace mindfulness today.",
            img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80"
        },
        "10-05": {
            title: "📚 World Teachers’ Day",
            message: "Honoring the incredible educators who shape our minds and inspire our futures.",
            img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?auto=format&fit=crop&w=1200&q=80"
        },
        "10-31": {
            title: "🎃 Happy Halloween!",
            message: "Wishing everyone a fun, exciting, and spooky Halloween night!",
            img: "https://images.unsplash.com/photo-1507914372361-3ba9fda3b8ba?auto=format&fit=crop&w=1200&q=80"
        },
        "11-28": {
            title: "🤖 Bot Testing Day!",
            message: "Greetings everyone! Today is a special testing event to ensure smooth and reliable performance for all future bot features.",
            img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
        },
        "12-10": {
            title: "🌐 Human Rights Day",
            message: "Standing united for equality, dignity, and justice for all.",
            img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
        },
        "12-25": {
            title: "🎄 Merry Christmas!",
            message: "Warm wishes of joy, peace, and harmony to everyone celebrating today.",
            img: "https://images.unsplash.com/photo-1544207240-01116343b3d8?auto=format&fit=crop&w=1200&q=80"
        }
    };
}

module.exports = (client) => {
    cron.schedule(
        "43 13 * * *", // runs daily at 13:43 IST
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

            // Thanksgiving dynamic date check
            const year = new Date().getFullYear();
            const thanksgivingDate = getThanksgivingDate(year);

            const thanksKey = `${String(thanksgivingDate.getMonth() + 1).padStart(2, "0")}-${String(
                thanksgivingDate.getDate()
            ).padStart(2, "0")}`;

            if (todayKey === thanksKey) {
                festival = {
                    title: "🦃 Happy Thanksgiving!",
                    message: "Warm wishes of gratitude, togetherness, and joy to everyone in our community.",
                    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80"
                };
            }

            if (!festival) return;

            try {
                const channel = await client.channels.fetch(FESTIVAL_CHANNEL);

                const embed = new EmbedBuilder()
                    .setTitle(festival.title)
                    .setDescription(festival.message)
                    .setImage(festival.img)
                    .setColor("#f7b558")
                    .setTimestamp();

                await channel.send({
                    content: "@everyone",
                    embeds: [embed]
                });

                console.log(`🎉 Festival message sent: ${festival.title}`);
            } catch (err) {
                console.error("❌ Festival message error:", err);
            }
        },
        { timezone: "Asia/Kolkata" }
    );
};