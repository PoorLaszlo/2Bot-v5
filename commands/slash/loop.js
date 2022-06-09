const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("loop")
  .setDescription("Loop the current song")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("**Semmi nem megy éppen...**")],
      });
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
    if (player.setTrackRepeat(!player.trackRepeat));
    const trackRepeat = player.trackRepeat ? "bekapcsolva" : "kikapcsolva";

    let loopembed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(`👍 | **Loop \`${trackRepeat}\`**`);
    interaction.reply({ embeds: [loopembed] });
  });

module.exports = command;
