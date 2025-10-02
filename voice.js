const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    NoSubscriberBehavior 
} = require("@discordjs/voice");

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

        // Tạo player nhưng không cần phát resource
        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Play }
        });

        // Chỉ cần subscribe player để giữ kết nối
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
