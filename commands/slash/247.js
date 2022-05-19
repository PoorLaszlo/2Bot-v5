const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("247")
  .setDescription("toggles 24/7")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
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
    if (!player) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("**Nincs mit játszani 24/7 módban!**")],
      });
    } else if (player.twentyFourSeven) {
      player.twentyFourSeven = false;
      const embed = client.Embed(`✅ | **24/7 mód kikapcsolva.**`);
      return interaction.reply({ embeds: [embed] });
    } else {
      player.twentyFourSeven = true;
      const embed = client.Embed(`✅ | **24/7 mód bekapcsolva.**`);
      return interaction.reply({ embeds: [embed] });
    }
  });
module.exports = command;
// check above message, it is a little bit confusing. and erros are not handled. probably should be fixed.
// ok use catch ez kom  follow meh ;_;
// the above message meaning error, if it cant find it or take too long the bot crashed
// play commanddddd, if timeout or takes 1000 years to find song it crashed
// OKIE, leave the comment here for idk
