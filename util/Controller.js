const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  let guild = client.guilds.cache.get(interaction.customId.split(":")[1]);
  let property = interaction.customId.split(":")[2];
  let player = client.manager.get(guild.id);

  if (!player) {
    interaction.reply({
      embeds: [
        client.Embed("❌ | **Nincs irányítható bot a szerveren...**"),
      ],
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
    return;
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
    !interaction.guild.me.voice.channel.equals(interaction.member.voice.channel)
  ) {
    const sameEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(
        "❌ | **Ugyanabban a hívásban kell lenned a bottal!**"
      );
    return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
  }
  if (property === "LowVolume") {
    player.setVolume(player.volume - 10);
    interaction.reply({
      embeds: [
        client.Embed(
          "🔉 | **Hangerő sikeresen beállítva erre:** `" +
            player.volume +
            "%`"
        ),
      ],
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
    return;
  }

  // if theres no previous song, return an error.
  if (property === "Replay") {
    if (!player.queue.previous) {
      interaction.reply({
        embeds: [client.Embed("❌ | **Nincs újrajátszandó zene.**")],
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
      return;
    }
    const currentSong = player.queue.current;
    player.play(player.queue.previous);
    if (currentSong) player.queue.unshift(currentSong);
    return;
  }

  if (property === "PlayAndPause") {
    if (player.paused) player.pause(false);
    else player.pause(true);
    interaction.reply({
      embeds: [
        client.Embed(
          player.paused
            ? ":white_check_mark: | **Szüneteltetve!**"
            : ":white_check_mark: | **Folytatva!**"
        ),
      ],
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
    return;
  }

  if (property === "Next") {
    player.stop();
    return interaction.deferUpdate();
  }

  if (property === "HighVolume") {
    // increase volume by 10% else if volume at 200% do nothing
    if (player.volume < 125) {
      player.setVolume(player.volume + 5);
      interaction.reply({
        embeds: [
          client.Embed(
            "🔊 | **Hangerő sikeresen beállítva erre:** `" +
              player.volume +
              "%`"
          ),
        ],
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    } else {
      interaction.reply({
        embeds: [
          client.Embed(
            "👍 | **Hangerő maximális:** `" + player.volume + "%`"
          ),
        ],
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    }
    return;
  }

  return interaction.reply({
    ephemeral: true,
    content: "❌ | **Unknown controller option**",
  });
};
