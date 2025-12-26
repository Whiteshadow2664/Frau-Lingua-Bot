const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    getVoiceConnection
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");

const VC_ID = "1453626819990257740"; // General VC ID

let player = null;

module.exports = {
    name: "play",

    async execute(message, args, client) {
        const command = message.content.split(" ")[0];

        // ================= PLAY =================
        if (command === "!play") {
            const url = args[0];
            if (!url || !ytdl.validateURL(url)) {
                return message.reply("❌ Please provide a valid YouTube link.");
            }

            try {
                const voiceChannel = await client.channels.fetch(VC_ID);

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                    selfDeaf: false
                });

                if (!player) {
                    player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Pause
                        }
                    });

                    connection.subscribe(player);
                }

                const stream = ytdl(url, {
                    filter: "audioonly",
                    quality: "highestaudio",
                    highWaterMark: 1 << 25
                });

                const resource = createAudioResource(stream, {
                    inlineVolume: true
                });

                resource.volume.setVolume(1);

                player.play(resource);

                player.once(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                    player = null;
                });

                await message.reply("▶️ **Now playing audio**");

            } catch (err) {
                console.error(err);
                message.reply("❌ Failed to play audio.");
            }
        }

        // ================= PAUSE =================
        if (command === "!pause") {
            if (!player) return message.reply("⚠️ Nothing is playing.");
            player.pause();
            return message.reply("⏸️ Paused.");
        }

        // ================= STOP =================
        if (command === "!stop") {
            const connection = getVoiceConnection(message.guild.id);

            if (player) {
                player.stop();
                player = null;
            }

            if (connection) connection.destroy();

            return message.reply("⏹️ Stopped and left voice channel.");
        }
    }
};