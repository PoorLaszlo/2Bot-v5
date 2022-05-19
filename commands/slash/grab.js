const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
  .setName("grab")
  .setDescription("Saves current song to your DM's")
  .setRun(async (client, interaction) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(":x: | **Semmi nem megy éppen...**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          ":x: | **Lépj be egy hívásba a parancs lefuttatása előtt!**"
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
          ":x: | **Ugyanabban a hívásban kell lenned a bottal!**"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    const save = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: "Zene lementve",
        iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `**[${player.queue.current.title}](${player.queue.current.uri}) elküldve privát üzenetben.**`
      )
      .addFields(
        {
          name: "Zene hossz",
          value: `\`${prettyMilliseconds(player.queue.current.duration, {
            colonNotation: true,
          })}\``,
          inline: true,
        },
        {
          name: "Zene feltöltő",
          value: `\`${player.queue.current.author}\``,
          inline: true,
        },
        {
          name: "Szerver",
          value: `\`${interaction.guild}\``,
          inline: true,
        }
      );

    interaction.user.send({ embeds: [save] });

    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            "Kérlek nézz rá a **privát üzeneteidre**. Ha nem érkezik üzenet tőlem ellenőrizd, hogy a **privát üzeneteid** nyitottra vannak állítva!"
          ),
      ],
      ephemeral: true,
    });
  });

module.exports = command;
