const SlashCommand = require("../../lib/SlashCommand");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

const prettyMilliseconds = require("pretty-ms");
const command = new SlashCommand()
  .setName("search")
  .setDescription("Search for a song")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("The song to search for")
      .setRequired(true)
  )

  .setRun(async (client, interaction, options) => {
    const result = interaction.options.getString("query");
    let player = client.manager.get(interaction.guild.id);

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
      player = client.manager.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel.id,
        selfDeafen: client.config.selfDeafen,
        volume: client.config.defaultVolume,
      });
    }

    if (player.state !== "CONNECTED") {
      player.connect();
    }

    let res;
    const search = result;

    try {
      res = await player.search(search, interaction.user);
      if (res.loadType === "LOAD_FAILED") {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setDescription("Egy hiba lépett közbe a zene keresése közben")
              .setColor(client.config.embedColor),
          ],
          ephemeral: true,
        });
      }
    } catch (err) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: "Egy hiba lépett közbe a zene keresése közben",
            })
            //.setAuthor("An error occured while searching for the song")
            .setColor(client.config.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (res.loadType == "NO_MATCHES") {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Nincs találat a keresésre: \`${search}\``)
            .setColor(client.config.embedColor),
        ],
        ephemeral: true,
      });
    } else {
      let max = 10;
      if (res.tracks.length < max) max = res.tracks.length;

      let resultFromSearch = [];

      res.tracks.slice(0, max).map((track) => {
        resultFromSearch.push({
          label: `${track.title}`,
          value: `${track.uri}`,
          description: track.isStream
            ? `ÉLŐ`
            : `${prettyMilliseconds(track.duration, {
                secondsDecimalDigits: 0,
              })} - ${track.author}`,
        });
      });

      const menus = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setMinValues(1)
          .setMaxValues(1)
          .setCustomId("select")
          .setPlaceholder("Select a song")
          .addOptions(resultFromSearch)
      );

      await interaction.deferReply();

      let choosenTracks = await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setDescription(
              `Itt vannak a keresési találatok a keresésre: \`${result}\`. Kérlek válaszd ki a zenét \`30 mp alatt\``
            ),
        ],
        components: [menus],
      });
      const filter = (button) => button.user.id === interaction.user.id;

      const tracksCollector = choosenTracks.createMessageComponentCollector({
        filter,
        time: 30000,
      });
      tracksCollector.on("collect", async (i) => {
        if (i.isSelectMenu()) {
          await i.deferUpdate();
          let uriFromCollector = i.values[0];
          let trackForPlay;

          trackForPlay = await player?.search(
            uriFromCollector,
            interaction.user
          );
          if (player?.queue) {
            const r = trackForPlay.tracks[0];
            if (player.get("autoplay")) {
            const psba = player.get("autoplayed") || [];
              if (r) {
                if (!psba.includes(r.identifier)) {
                  psba.push(r.identifier);
                }
              }
              while (psba.length > 100) psba.shift();
              player.set("autoplayed", psba);
            }
            player.queue.add(r);
          }
          if (!player?.playing && !player?.paused && !player?.queue?.size)
            player?.play();
          i.editReply({
            content: null,
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `Hozzáadva [${trackForPlay?.tracks[0]?.title}](${trackForPlay?.tracks[0].uri}) [${trackForPlay?.tracks[0]?.requester}]`
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
      tracksCollector.on("end", async (i) => {
        if (i.size == 0) {
          choosenTracks.edit({
            content: null,
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `Nincs kiválasztott zene. Túl lassú voltál.`
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
    }
  });

module.exports = command;
