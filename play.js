const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require('@discordjs/voice');

const ytdl = require('ytdl-core');

const VC_ID = '1453626819990257740'; // General VC
let connection;
let player;

async function handle(message, client) {
  const [command, ...args] = message.content.split(' ');

  // ---------- PLAY ----------
  if (command === '!play') {
    if (!args[0]) {
      return message.reply('❌ Please provide a YouTube link.');
    }

    if (!ytdl.validateURL(args[0])) {
      return message.reply('❌ Invalid YouTube URL.');
    }

    connection = joinVoiceChannel({
      channelId: VC_ID,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    });

    const stream = ytdl(args[0], {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    });

    const resource = createAudioResource(stream);
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
      message.channel.send('▶️ Now playing audio');
    });

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  }

  // ---------- PAUSE ----------
  if (command === '!pause') {
    if (!player) return message.reply('⚠️ Nothing is playing.');
    player.pause();
    message.reply('⏸️ Paused');
  }

  // ---------- STOP ----------
  if (command === '!stop') {
    if (!player) return message.reply('⚠️ Nothing is playing.');
    player.stop();
    connection.destroy();
    message.reply('⏹️ Stopped and left VC');
  }
}

module.exports = { handle };