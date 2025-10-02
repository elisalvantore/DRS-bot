const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    NoSubscriberBehavior, 
    AudioPlayerStatus 
} = require("@discordjs/voice");
const path = require("path");
const { spawn } = require("child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

const connections = new Map();

function createSilenceResource(filePath) {
    // dùng ffmpeg để decode mp3 -> PCM
    const ffmpegProcess = spawn(ffmpeg.path, [
        "-i", filePath,       // input file
        "-analyzeduration", "0",
        "-loglevel", "0",
        "-f", "s16le",        // PCM 16bit
        "-ar", "48000",       // sample rate
        "-ac", "2",           // stereo
        "pipe:1"
    ], { stdio: ["ignore", "pipe", "ignore"] });

    return createAudioResource(ffmpegProcess.stdout);
}

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
        let resource = createSilenceResource(silencePath);

        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            resource = createSilenceResource(silencePath); // tạo stream mới
            player.play(resource);
        });

        player.on("error", (err) => console.error("⚠️ Player error:", err.message));
        connection.on("error", (err) => console.error("⚠️ Connection error:", err.message));

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
