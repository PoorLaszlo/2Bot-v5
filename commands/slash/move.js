const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("move")
  .setDescription("Moves track to a different position")
  .addIntegerOption((option) =>
    option
      .setName("track")
      .setDescription("The track number to move")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("position")
      .setDescription("The position to move the track to")
      .setRequired(true)
  )

  .setRun(async (client, interaction) => {
    const track = interaction.options.getInteger("track");
    const position = interaction.options.getInteger("position");

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
        .setDescription("Lépj be egy hívásba a parancs lefuttatása előtt!");
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
          "Ugyanabban a hívásban kell lenned a bottal!"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    let trackNum = Number(track) - 1;
    if (trackNum < 0 || trackNum > player.queue.length - 1) {
      return interaction.reply(":x: | **Helytelen zene sorszám**");
    }

    let dest = Number(position) - 1;
    if (dest < 0 || dest > player.queue.length - 1) {
      return interaction.reply(":x: | **Helytelen pozíció sorszám**");
    }

    const thing = player.queue[trackNum];
    player.queue.splice(trackNum, 1);
    player.queue.splice(dest, 0, thing);
    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(":white_check_mark: | **Zene áthelyezve**"),
      ],
    });
  });

module.exports = command;
