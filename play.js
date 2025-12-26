const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
    NoSubscriberBehavior
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");

const VC_ID = "1453626819990257740"; // General VC ID

let player;
let connection;

module.exports = async (client, message) => {
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
            // Join VC
            connection = joinVoiceChannel({
                channelId: VC_ID,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: true
            });

            // Create player only once
            if (!player) {
                player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause
                    }
                });

                connection.subscribe(player);
            }

            // Create stream
            const stream = ytdl(url, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary
            });

            player.play(resource);

            player.once(AudioPlayerStatus.Playing, () => {
                message.channel.send("▶️ Now playing!");
            });

            player.once(AudioPlayerStatus.Idle, () => {
                // Auto stop after song ends
                connection.destroy();
                player = null;
                connection = null;
            });

        } catch (err) {
            console.error(err);
            message.reply("❌ Failed to play audio.");
        }
    }

    // ---------------- PAUSE ----------------
    if (command === "!pause") {
        if (!player) return message.reply("❌ Nothing is playing.");
        player.pause();
        message.reply("⏸️ Paused.");
    }

    // ---------------- STOP ----------------
    if (command === "!stop") {
        if (!player || !connection) {
            return message.reply("❌ Nothing to stop.");
        }

        player.stop();
        connection.destroy();

        player = null;
        connection = null;

        message.reply("⏹️ Stopped and left voice channel.");
    }
};