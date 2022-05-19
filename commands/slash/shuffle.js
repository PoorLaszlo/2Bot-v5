const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("shuffle")
  .setDescription("Shuffle the current queue.")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("❌ | **Semmi nem megy éppen...**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | **Lépj be egy hívásba a parancs lefuttatása előtt!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    if (
      interaction.guild.me.voice.channel &&
      !interaction.guild.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    ) {
      const sameEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | **Ugyanabban a hívásban kell lenned a bottal!**"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    if (!player.queue || !player.queue.length || player.queue.length === 0) {
      const addEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("❌ | **Üres a várólista...**");
      return interaction.reply({ embeds: [addEmbed], ephemeral: true });
    }

    //  if the queue is not empty, shuffle the entire queue
    player.queue.shuffle();
    const shuffleEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription("🔀 | **Várólista sikeresen megkeverve.**");
    return interaction.reply({ embeds: [shuffleEmbed] });
  });

module.exports = command;
