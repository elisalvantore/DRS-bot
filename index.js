const { Client, GatewayIntentBits } = require("discord.js");
const { handleVoiceCommand, stayInChannel } = require("./voice");
require("dotenv").config();

const PREFIX = "d!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once("ready", () => {
    console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}`);
    stayInChannel(client); // Giữ bot ở kênh voice 24/7
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        return message.reply("🏓 Pong!");
    }

    if (["join", "leave"].includes(command)) {
        return handleVoiceCommand(command, message);
    }
});

client.login(process.env.TOKEN);

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Health check server on port ${PORT}`));