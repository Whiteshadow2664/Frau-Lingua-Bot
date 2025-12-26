const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    getVoiceConnection
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");

const VC_ID = "1453626819990257740"; // General VC ID

let player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

module.exports = {
    async execute(message) {
        if (!message.content.startsWith("!")) return;

        const args = message.content.split(" ");
        const command = args[0].toLowerCase();

        // ---------------- PLAY ----------------
        if (command === "!play") {
            const url = args[1];
            if (!url || !ytdl.validateURL(url)) {
                return message.reply("❌ Please provide a valid YouTube link.");
            }

            try {
                const connection = joinVoiceChannel({
                    channelId: VC_ID,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                const stream = ytdl(url, {
                    filter: "audioonly",
                    quality: "highestaudio",
                    highWaterMark: 1 << 25,
                });

                stream.on("error", err => {
                    console.error("❌ YTDL STREAM ERROR:", err);
                });

                const resource = createAudioResource(stream);
                player.play(resource);
                connection.subscribe(player);

                message.reply("▶️ Now playing audio.");

            } catch (err) {
                console.error("❌ PLAY ERROR:", err);
                message.reply("❌ Failed to play audio.");
            }
        }

        // ---------------- PAUSE ----------------
        if (command === "!pause") {
            player.pause();
            message.reply("⏸️ Paused.");
        }

        // ---------------- STOP ----------------
        if (command === "!stop") {
            player.stop();

            const connection = getVoiceConnection(message.guild.id);
            if (connection) connection.destroy();

            message.reply("⏹️ Stopped and left voice channel.");
        }
    }
};