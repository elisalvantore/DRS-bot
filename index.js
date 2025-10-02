require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { handleVoiceCommand } = require("./voice");

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
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // test ping
    if (command === "ping") {
        return message.reply("🏓 Pong!");
    }

    // voice command (join/leave)
    if (["join", "leave"].includes(command)) {
        return handleVoiceCommand(command, message);
    }
});

client.login(process.env.TOKEN);