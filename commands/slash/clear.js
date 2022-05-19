const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("clear")
  .setDescription("Clear all tracks from queue")
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
      let cembed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("❌ | **Hiba, nincs kitörlendő zene.**");

      return interaction.reply({ embeds: [cembed], ephemeral: true });
    }

    player.queue.clear();

    let clearembed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(`✅ | **Várólista törölve!**`);

    return interaction.reply({ embeds: [clearembed] });
  });

module.exports = command;
