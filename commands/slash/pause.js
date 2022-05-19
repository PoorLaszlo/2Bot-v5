const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("pause")
  .setDescription("Pause current playing track")
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

    if (player.paused) {
      let pembed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("❌ | **A jelenlegi zeneszám már szüneteltetve van!**");
      return interaction.reply({ embeds: [pembed], ephemeral: true });
    }

    player.pause(true);

    let pauseembed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(`⏸ **Szüneteltetve!**`);
    return interaction.reply({ embeds: [pauseembed] });
  });

module.exports = command;
