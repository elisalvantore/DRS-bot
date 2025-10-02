const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    NoSubscriberBehavior, 
    AudioPlayerStatus,
    StreamType
} = require("@discordjs/voice");
const path = require("path");

// dùng ffmpeg từ package
const ffmpeg = require("@ffmpeg-installer/ffmpeg");
process.env.FFMPEG_PATH = ffmpeg.path;

const connections = new Map();

function handleVoiceCommand(command, message) {
    if (command === "join") {
        if (!message.member.voice.channel) {
            return message.reply("❌ Bạn phải vào voice channel trước đã!");
        }

        const channel = message.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });

        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Play }
        });

        const silencePath = path.join(__dirname, "silence.mp3");
        const resource = createAudioResource(silencePath, {
            inputType: StreamType.Arbitrary
        });

        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            player.play(createAudioResource(silencePath, {
                inputType: StreamType.Arbitrary
            }));
        });

        player.on("error", (error) => {
            console.error("⚠️ Lỗi player:", error.message);
        });

        connection.on("error", (err) => {
            console.error("⚠️ Lỗi connection:", err.message);
        });

        connection.subscribe(player);
        connections.set(message.guild.id, { connection, player });

        return message.reply(`🔊 Bot đã vào kênh: **${channel.name}** và sẽ treo 24/7`);
    }

    if (command === "leave") {
        const connData = connections.get(message.guild.id);
        if (!connData) {
            return message.reply("⚠️ Bot không ở trong voice channel nào!");
        }
        connData.connection.destroy();
        connections.delete(message.guild.id);
        return message.reply("👋 Bot đã rời khỏi voice channel.");
    }
}

module.exports = { handleVoiceCommand };
