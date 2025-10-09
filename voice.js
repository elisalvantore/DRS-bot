const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus, 
  entersState 
} = require('@discordjs/voice');
const path = require('path');

let connection;
let player;

// === Tạo audio im lặng để giữ bot không bị ngắt ===
function createSilenceResource() {
  const filePath = path.join(__dirname, 'silence.mp3');
  return createAudioResource(filePath);
}

// === Hàm phát audio im lặng vĩnh viễn ===
async function joinAndPlayForever(voiceChannel) {
  try {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    player = createAudioPlayer();

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('🔁 Phát lại silence.mp3 để giữ kết nối');
      player.play(createSilenceResource());
    });

    player.on('error', err => {
      console.error('⚠️ Lỗi khi phát audio:', err.message);
      player.play(createSilenceResource());
    });

    const resource = createSilenceResource();
    player.play(resource);
    connection.subscribe(player);

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('✅ Bot đã vào voice và đang phát 24/7!');
  } catch (err) {
    console.error('❌ Không thể vào voice:', err);
  }
}

// === Lệnh join/leave theo người dùng ===
async function handleVoiceCommand(command, message) {
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) return message.reply("⚠️ Bạn phải vào kênh voice trước!");

  if (command === "join") {
    await joinAndPlayForever(voiceChannel);
    return message.reply("✅ Bot đã vào kênh voice!");
  }

  if (command === "leave") {
    if (connection) {
      connection.destroy();
      connection = null;
      return message.reply("👋 Bot đã rời khỏi kênh voice!");
    } else {
      return message.reply("❌ Bot chưa ở trong kênh voice nào!");
    }
  }
}

// === Giữ bot 24/7 trong 1 kênh cố định ===
function stayInChannel(client) {
  const GUILD_ID = "1409910972788899852";
  const VOICE_CHANNEL_ID = "1411311590539657276";

  client.once("ready", async () => {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);
      if (channel && channel.isVoiceBased()) {
        console.log("🔊 Bot đang tự vào kênh voice 24/7...");
        await joinAndPlayForever(channel);
      }
    } catch (err) {
      console.error("⚠️ Lỗi khi tự vào voice:", err);
    }
  });
}

module.exports = { handleVoiceCommand, stayInChannel };
