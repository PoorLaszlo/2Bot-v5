const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
  .setName("nowplaying")
  .setDescription("Shows the current song playing in the voice channel.")
  .setRun(async (client, interaction, options) => {
    const player = interaction.client.manager.players.get(interaction.guild.id);

    if (!player) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("Semmi nem megy éppen a várólistán...");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!player.playing) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("Semmi nem megy éppen...");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    const song = player.queue.current;
    const embed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setTitle("Jelenlegi zene ♪")
      // show who requested the song via setField, also show the duration of the song
      .setFields([
        {
          name: "Kérte",
          value: `<@${song.requester.id}>`,
          inline: true,
        },
        // show duration if live show live
        {
          name: "Hossz",
          value: song.isStream
            ? `\`ÉLŐ\``
            : `\`${prettyMilliseconds(player.position, {
                secondsDecimalDigits: 0,
              })} / ${prettyMilliseconds(song.duration, {
                secondsDecimalDigits: 0,
              })}\``,
          inline: true,
        },
      ])
      // show the thumbnail of the song using displayThumbnail("maxresdefault")
      .setThumbnail(song.displayThumbnail("maxresdefault"))
      // show the title of the song and link to it
      .setDescription(`[${song.title}](${song.uri})`);
    return interaction.reply({ embeds: [embed] });
  });
module.exports = command;
