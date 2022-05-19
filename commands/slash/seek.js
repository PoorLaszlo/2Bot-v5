const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
  .setName("seek")
  .setDescription("Seek to a specific time in the current song.")
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("Seek to time you want. Ex 2m | 10s | 53s")
      .setRequired(true)
  )

  .setRun(async (client, interaction, options) => {
    const args = interaction.options.getString("time");

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
    await interaction.deferReply();

    const time = ms(args);
    const position = player.position;
    const duration = player.queue.current.duration;

    if (time <= duration) {
      if (time > position) {
        player.seek(time);
        let thing = new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `⏩ | **${player.queue.current.title}** eltekerve **${ms(
              time
            )}-ig.**`
          );
        return interaction.editReply({ embeds: [thing] });
      } else {
        player.seek(time);
        let thing = new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `⏩ | **${player.queue.current.title}** eltekerve **${ms(
              time
            )}-ig.**`
          );
        return interaction.editReply({ embeds: [thing] });
      }
    } else {
      let thing = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          `Sikertelen eltekerés. A zene hosszát nem haladhatja meg a tekerés hossza.`
        );
      return interaction.editReply({ embeds: [thing] });
    }
  });

module.exports = command;
