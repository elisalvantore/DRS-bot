const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require("@discordjs/voice");
const path = require("path");

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

        const resource = createAudioResource(path.join(__dirname, "silence.mp3"));
        player.play(resource);

        // loop lại sau khi phát xong
        player.on(AudioPlayerStatus.Idle, () => {
            player.play(createAudioResource(path.join(__dirname, "silence.mp3")));
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
