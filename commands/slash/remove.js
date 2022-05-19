const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("remove")
  .setDescription("Remove track you don't want from queue")
  .addNumberOption((option) =>
    option
      .setName("number")
      .setDescription("Enter track number.")
      .setRequired(true)
  )

  .setRun(async (client, interaction) => {
    const args = interaction.options.getNumber("number");

    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("Semmi nem megy éppen...");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "Lépj be egy hívásba a parancs lefuttatása előtt!"
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
          "Ugyanabban a hívásban kell lenned a bottal!"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    await interaction.deferReply();

    const position = Number(args) - 1;
    if (position > player.queue.size) {
      let thing = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          `A jelenlegi várólista csak **${player.queue.size}** zeneszám hosszú`
        );
      return interaction.editReply({ embeds: [thing] });
    }

    const song = player.queue[position];
    player.queue.remove(position);

    const number = position + 1;
    let thing = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(`**${number}**-es zeneszám eltávolítva a várólistáról`);
    return interaction.editReply({ embeds: [thing] });
  });

module.exports = command;
