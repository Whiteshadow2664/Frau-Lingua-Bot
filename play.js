const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const VOICE_CHANNEL_ID = "1453626819990257740"; // General VC

let connection = null;
let player = null;

module.exports = {
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(" ");
        const command = args[0];

        /* ================= PLAY ================= */
        if (command === "!play") {
            const url = args[1];

            if (!url || !ytdl.validateURL(url)) {
                return message.reply("❌ Provide a valid YouTube link.");
            }

            const channel = message.guild.channels.cache.get(VOICE_CHANNEL_ID);
            if (!channel || channel.type !== 2) {
                return message.reply("❌ Voice channel not found.");
            }

            // Join VC if not already
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                    selfDeaf: false
                });
            }

            // Create player if not exists
            if (!player) {
                player = createAudioPlayer();
                connection.subscribe(player);
            }

            const stream = ytdl(url, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream);
            player.play(resource);

            message.channel.send("▶️ **Playing audio...**");

            player.once(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                connection = null;
                player = null;
            });
        }

        /* ================= PAUSE ================= */
        if (command === "!pause") {
            if (!player) {
                return message.reply("❌ Nothing is playing.");
            }

            player.pause();
            message.channel.send("⏸️ **Paused**");
        }

        /* ================= STOP ================= */
        if (command === "!stop") {
            if (!player || !connection) {
                return message.reply("❌ Nothing to stop.");
            }

            player.stop();
            connection.destroy();

            player = null;
            connection = null;

            message.channel.send("⏹️ **Stopped and left voice channel**");
        }
    }
};