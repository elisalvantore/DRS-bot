const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const PREFIX = "d!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}`);
    client.user.setActivity("Đang chơi PUBG cùng DRS! ❤️", { type: "PLAYING" });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        return message.reply(`🏓 Pong! Ping: ${client.ws.ping}ms`);
    }
});

client.login(process.env.TOKEN);

// Health check server
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Health check server on port ${PORT}`));