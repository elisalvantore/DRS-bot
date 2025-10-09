require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { stayInChannel } = require('./voice');

// === Tạo server Express để giữ cho bot luôn "active" ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('✅ Bot DRS đang hoạt động 24/7!'));
app.listen(PORT, () => console.log(`🌐 Web server chạy trên cổng ${PORT}`));

// === Cấu hình bot Discord ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', async () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch('1409910972788899852'); // 🧩 ID server discord
    const channel = await guild.channels.fetch('1411311590539657276'); // 🧩 ID kênh voice

    stayInChannel(channel);
  } catch (error) {
    console.error('❌ Lỗi khi vào kênh voice:', error);
  }
});

client.login(process.env.TOKEN);
