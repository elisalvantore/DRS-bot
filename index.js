require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { handleVoiceCommand } = require("./voice");

const PREFIX = process.env.PREFIX || "d!"; // Lấy prefix từ .env hoặc mặc định là d!
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Cooldowns để tránh spam
client.cooldowns = new Collection();

// Bot ready
client.once("ready", () => {
    console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}`);
});

// Nhận lệnh
client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ⏳ Cooldown: 2s mỗi user
    const now = Date.now();
    const cooldownAmount = 2000;
    if (client.cooldowns.has(message.author.id)) {
        const expirationTime = client.cooldowns.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return message.reply(`⏳ Vui lòng đợi ${timeLeft}s trước khi dùng lệnh tiếp.`);
        }
    }
    client.cooldowns.set(message.author.id, now);

    // 🏓 Lệnh test ping
    if (command === "ping") {
        return message.reply("🏓 Pong!");
    }

    // 🎙️ Lệnh voice (đã xử lý trong voice.js)
    if (["join", "leave"].includes(command)) {
        return handleVoiceCommand(command, message);
    }

    // ❓ Nếu lệnh không hợp lệ
    return message.reply("❌ Lệnh không hợp lệ. Hãy thử: `d!ping`, `d!join`, `d!leave`");
});

// Xử lý lỗi toàn cục
process.on("unhandledRejection", (error) => {
    console.error("❌ Lỗi ngoài dự kiến:", error);
});
client.on("error", (err) => console.error("❌ Bot gặp lỗi:", err));
client.on("warn", (info) => console.warn("⚠️ Cảnh báo:", info));

// Kiểm tra TOKEN trước khi login
if (!process.env.TOKEN) {
    console.error("❌ Thiếu TOKEN trong biến môi trường!");
    process.exit(1);
}

client.login(process.env.TOKEN);
