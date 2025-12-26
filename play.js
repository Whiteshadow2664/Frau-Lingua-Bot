// play.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

// Map to store player data per guild
const playerMap = new Map();

module.exports.execute = async (message, args, client, command) => {
    try {
        // General VC channel ID
        const vcChannelId = "1453626819990257740"; 
        const vcChannel = client.channels.cache.get(vcChannelId);

        if (!vcChannel) return message.reply("❌ Voice channel not found.");

        // Get or create player for this guild
        let playerData = playerMap.get(message.guild.id);
        if (!playerData) {
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            const connection = joinVoiceChannel({
                channelId: vcChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            connection.subscribe(player);

            playerData = { player, connection, resource: null };
            playerMap.set(message.guild.id, playerData);
        }

        const { player } = playerData;

        // PLAY command
        if (command === "!play") {
            if (!args[0]) return message.reply("❌ Please provide a YouTube link.");
            const url = args[0];

            if (!ytdl.validateURL(url)) return message.reply("❌ Invalid YouTube URL.");

            const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            const resource = createAudioResource(stream);
            player.play(resource);
            playerData.resource = resource;

            await message.channel.send(`▶️ Now playing: ${url}`);
        }

        // PAUSE command
        if (command === "!pause") {
            if (player.state.status !== AudioPlayerStatus.Playing) {
                return message.reply("⏸️ Nothing is playing currently.");
            }
            player.pause();
            await message.channel.send("⏸️ Paused the audio.");
        }

        // STOP command
        if (command === "!stop") {
            player.stop();
            await message.channel.send("⏹️ Stopped the audio.");
        }

        // Auto disconnect logic if idle for 5 minutes
        player.on(AudioPlayerStatus.Idle, () => {
            setTimeout(() => {
                if (player.state.status === AudioPlayerStatus.Idle) {
                    const connection = playerData.connection;
                    connection.destroy();
                    playerMap.delete(message.guild.id);
                    message.channel.send("🔌 Disconnected due to inactivity.");
                }
            }, 5 * 60 * 1000); // 5 minutes
        });

    } catch (err) {
        console.error("❌ Error in play.js:", err);
        message.reply("❌ Something went wrong with the audio player.");
    }
};