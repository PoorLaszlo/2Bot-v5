// const { Manager } = require("erela.js/structures/Manager");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("play")
  .setDescription("Play music in the voice channel")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("Search string to search the music")
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let node = await client.getLavalink(client);
    if (!node) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("A Lavalink node nincs csatlakoztatva!")],
      });
    }
    let query = options.getString("query", true);
    let player = client.createPlayer(interaction.channel, channel);
    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | **Lépj be egy hívásba a parancs lefuttatása előtt!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }
    if (player.state !== "CONNECTED") {
      player.connect();
    }
    // console.log(player);
    // if the channel is a stage channel then request to speak
    if (channel.type == "GUILD_STAGE_VOICE") {
      setTimeout(() => {
        if (interaction.guild.me.voice.suppress == true) {
          try {
            interaction.guild.me.voice.setSuppressed(false);
          } catch (e) {
            interaction.guild.me.voice.setRequestToSpeak(true);
          }
        }
      }, 2000); // set timeout are here, because bot sometimes takes time before reconising it's a stage.
    }

    await interaction.reply({
      embeds: [client.Embed(":mag_right: **Keresés...**")],
    });

    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(err);
      return {
        loadType: "LOAD_FAILED",
      };
    });

    if (res.loadType === "LOAD_FAILED") {
      if (!player.queue.current) player.destroy();
      return interaction
        .editReply({
          embeds: [client.ErrorEmbed("Egy hiba következett be a keresés közben")],
        })
        .catch(this.warn);
    }

    if (res.loadType === "NO_MATCHES") {
      if (!player.queue.current) player.destroy();
      return interaction
        .editReply({
          embeds: [client.ErrorEmbed("Nincsenek találatok")],
        })
        .catch(this.warn);
    }

    if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
      const r = res.tracks[0];
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
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      let addQueueEmbed = client
        .Embed()
        .setAuthor({ name: "Hozzáadva a várólistához", iconURL: client.config.iconURL })
        //.setAuthor("Added to queue", client.config.iconURL) Deprecated soon
        .setDescription(
          `[${res.tracks[0].title}](${res.tracks[0].uri})` || "Nincs cím"
        )
        .setURL(res.tracks[0].uri)
        .addField("Feltöltő", res.tracks[0].author, true)
        .addField(
          "Hossz",
          res.tracks[0].isStream
            ? `\`ÉLŐ\``
            : `\`${client.ms(res.tracks[0].duration, {
                colonNotation: true,
              })}\``,
          true
        );
      try {
        addQueueEmbed.setThumbnail(
          res.tracks[0].displayThumbnail("maxresdefault")
        );
      } catch (err) {
        addQueueEmbed.setThumbnail(res.tracks[0].thumbnail);
      }
      if (player.queue.totalSize > 1)
        addQueueEmbed.addField(
          "Pozíció a várólistán",
          `${player.queue.size - 0}`,
          true
        );
      return interaction
        .editReply({ embeds: [addQueueEmbed] })
        .catch(this.warn);
    }

    if (res.loadType === "PLAYLIST_LOADED") {
      if (player.get("autoplay")) {
        const psba = player.get("autoplayed") || [];
        for (const r of res.tracks) {
          if (r && !psba.includes(r.identifier)) {
            psba.push(r.identifier);
          }
        }
        while (psba.length > 100) psba.shift();
        player.set("autoplayed", psba);
      }
      player.queue.add(res.tracks);
      if (
        !player.playing &&
        !player.paused &&
        player.queue.totalSize === res.tracks.length
      )
        player.play();
      let playlistEmbed = client
        .Embed()
        .setAuthor({
          name: "Játszólista hozzáadva a várólistához",
          iconURL: client.config.iconURL,
        })
        //.setAuthor("Playlist added to queue", client.config.iconURL)
        .setThumbnail(res.tracks[0].thumbnail)
        .setDescription(`[${res.playlist.name}](${query})`)
        .addField("Várólistára rakva", `\`${res.tracks.length}\` zene`, false)
        .addField(
          "Játszólista hossz",
          `\`${client.ms(res.playlist.duration, {
            colonNotation: true,
          })}\``,
          false
        );
      return interaction
        .editReply({ embeds: [playlistEmbed] })
        .catch(this.warn);
    }
  });

module.exports = command;
