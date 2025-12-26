// play.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

// Store server audio data
const servers = {};

module.exports = {
    execute: async (message, args, client, command) => {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('You need to join a voice channel first!');

        // Initialize server data if not exists
        if (!servers[message.guild.id]) {
            servers[message.guild.id] = {
                player: createAudioPlayer(),
                resource: null,
                connection: null,
            };

            // Cleanup when player goes idle
            servers[message.guild.id].player.on(AudioPlayerStatus.Idle, () => {
                servers[message.guild.id].resource = null;
            });
        }

        const server = servers[message.guild.id];

        switch (command) {
            case '!play':
                if (!args[0]) return message.reply('Please provide a YouTube URL to play.');
                try {
                    // Join voice channel if not connected
                    if (!server.connection) {
                        server.connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator,
                        });
                        server.connection.subscribe(server.player);
                    }

                    const url = args[0];
                    if (!ytdl.validateURL(url)) return message.reply('Invalid YouTube URL.');

                    // Stream audio
                    const stream = await ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });
                    const resource = createAudioResource(stream);

                    server.resource = resource;
                    server.player.play(resource);

                    message.channel.send(`🎶 Now playing: ${url}`);
                } catch (error) {
                    console.error(error);
                    message.channel.send('An error occurred while trying to play the audio.');
                }
                break;

            case '!pause':
                if (!server.player) return message.reply('Nothing is playing right now.');
                server.player.pause();
                message.channel.send('⏸ Paused the audio.');
                break;

            case '!stop':
                if (!server.player) return message.reply('Nothing is playing right now.');
                server.player.stop();
                if (server.connection) {
                    server.connection.destroy();
                    server.connection = null;
                }
                message.channel.send('⏹ Stopped and left the voice channel.');
                break;

            default:
                message.reply('Command recognized but not implemented yet.');
        }
    }
};