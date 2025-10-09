const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
  createAudioPlayer
} = require("@discordjs/voice");

// === HÀM THAM GIA KÊNH VOICE ===
async function handleVoiceCommand(command, message) {
  const channel = message.member?.voice?.channel;
  if (!channel) return message.reply("⚠️ Bạn cần vào một kênh voice trước!");

  if (command === "join") {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false, // không tự tắt nghe
      selfMute: false, // không tự tắt mic
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`🔊 Bot đã vào kênh voice: ${channel.name}`);
      message.reply(`✅ Đã vào kênh voice: **${channel.name}** và sẽ ở lại 24/7.`);
    });

    connection.on("error", (error) => {
      console.error("❌ Lỗi voice:", error);
    });
  }

  if (command === "leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("⚠️ Bot hiện không ở trong kênh voice nào.");

    connection.destroy();
    message.reply("👋 Đã rời kênh voice.");
  }
}

// === HÀM TỰ Ở LẠI KÊNH VOICE 24/7 ===
async function stayInChannel(client) {
  // ID máy chủ và ID kênh voice mà bạn muốn bot ở lại 24/7
  const GUILD_ID = "1409910972788899852";      // ⚠️ Thay bằng ID thật
  const VOICE_CHANNEL_ID = "1411311590539657276";   // ⚠️ Thay bằng ID thật

  const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
  if (!guild) return console.log("❌ Không tìm thấy máy chủ 24/7.");

  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!channel) return console.log("❌ Không tìm thấy kênh voice 24/7.");

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false, // tắt mic để tiết kiệm tài nguyên
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log(`🎧 Bot đã vào kênh voice 24/7: ${channel.name}`);
  });

  connection.on("error", (error) => {
    console.error("❌ Lỗi kết nối voice 24/7:", error);
  });
}

module.exports = { handleVoiceCommand, stayInChannel };
