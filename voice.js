const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const path = require('path');

let connection;
let player;

// Tạo resource từ file silence.mp3
function createSilenceResource() {
  const filePath = path.join(__dirname, 'silence.mp3');
  return createAudioResource(filePath);
}

// Hàm để bot join kênh voice và phát nhạc 24/7
async function joinAndPlayForever(voiceChannel) {
  try {
    // Kết nối voice
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,  // không tắt mic
      selfMute: false   // không tắt loa
    });

    player = createAudioPlayer();

    // Khi audio kết thúc -> phát lại để giữ kết nối
    player.on(AudioPlayerStatus.Idle, () => {
      console.log('🔁 Phát lại silence.mp3 để giữ kết nối');
      player.play(createSilenceResource());
    });

    // Xử lý lỗi
    player.on('error', error => {
      console.error('⚠️ Lỗi khi phát audio:', error.message);
      player.play(createSilenceResource());
    });

    // Bắt đầu phát
    const resource = createSilenceResource();
    player.play(resource);

    // Kết nối player với voice
    connection.subscribe(player);

    // Đảm bảo kết nối ổn định
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('✅ Bot đã vào voice và đang phát 24/7!');
  } catch (error) {
    console.error('❌ Không thể vào voice:', error);
  }
}

// Xuất hàm cho file index.js gọi
module.exports = { joinAndPlayForever };
