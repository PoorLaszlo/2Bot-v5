const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("skip")
  .setDescription("Skip the current song")
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;
    let player = client.manager.players.get(interaction.guild.id);
    if (!player)
      return interaction.reply({
        embeds: [client.ErrorEmbed("Semmi nem megy éppen...")],
      });

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
    player.stop();
    interaction.reply({ embeds: [client.Embed("✅ | **Átlépve!**")] });
  });

module.exports = command;
