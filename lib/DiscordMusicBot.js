const {
  Client,
  Intents,
  MessageEmbed,
  Collection,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const prettyMilliseconds = require("pretty-ms");
const jsoning = require("jsoning"); // Documentation: https://jsoning.js.org/
const { Manager } = require("erela.js");
const ConfigFetcher = require("../util/getConfig");
const Logger = require("./Logger");
const spotify = require("better-erela.js-spotify").default;
const { default: AppleMusic } = require("better-erela.js-apple");
const deezer = require("erela.js-deezer");
const facebook = require("erela.js-facebook");
const Server = require("../api");
const getLavalink = require("../util/getLavalink");
const getChannel = require("../util/getChannel");
const colors = require("colors");
const filters = require("erela.js-filters");

require("./EpicPlayer");

class DiscordMusicBot extends Client {
  /**
   * Create the music client
   * @param {import("discord.js").ClientOptions} props - Client options
   */
  constructor(
    props = {
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
    }
  ) {
    super(props);

    ConfigFetcher()
      .then((conf) => {
        this.config = conf;
        this.build();
      })
      .catch((err) => {
        throw Error(err);
      });

    //Load Events and stuff
    /**@type {Collection<string, import("./SlashCommand")} */
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();

    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));

    this.LoadCommands();
    this.LoadEvents();

    this.database = new jsoning("db.json");

    this.getLavalink = getLavalink;
    this.getChannel = getChannel;
    this.ms = prettyMilliseconds;

    var globaljs = require("../deploy/global");
    globaljs.assignCommands;
  }

  /**
   * Send an info message
   * @param {string} text
   */
  log(text) {
    this.logger.log(text);
  }

  /**
   * Send an warning message
   * @param {string} text
   */
  warn(text) {
    //this.logger.warn(text);
  }

  /**
   * Build em
   */
  build() {
    this.warn("Started the bot...");
    this.login(this.config.token);
    this.server = new Server(this); //constructing also starts it
    if (this.config.debug === true) {
      this.warn("Debug mode is enabled!");
      this.warn("Only enable this if you know what you are doing!");
      process.on("unhandledRejection", (error) => console.log(error));
      process.on("uncaughtException", (error) => console.log(error));
    } else {
      process.on("unhandledRejection", (error) => {
        return;
      });
      process.on("uncaughtException", (error) => {
        return;
      });
    }

    let client = this;

    this.manager = new Manager({
      plugins: [
        new deezer(),
        new AppleMusic(),
        new spotify(),
        new facebook(),
        new filters(),
      ],
      autoPlay: true,
      nodes: this.config.nodes,
      retryDelay: this.config.retryDelay,
      retryAmount: this.config.retryAmount,
      clientName: `DiscordMusic/v${require("../package.json").version} (Bot: ${
        this.config.clientId
      })`,
      send: (id, payload) => {
        let guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    })
      .on("nodeConnect", (node) =>
        this.log(
          `Node: ${node.options.identifier} | Lavalink node is connected.`
        )
      )
      .on("nodeReconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is reconnecting.`
        )
      )
      .on("nodeDestroy", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is destroyed.`
        )
      )
      .on("nodeDisconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is disconnected.`
        )
      )
      .on("nodeError", (node, err) => {
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node has an error: ${err.message}.`
        );
      })
      // on track error warn and create embed
      .on("trackError", (player, err) => {
        this.warn(
          `Player: ${player.options.guild} | Track had an error: ${err.message}.`
        );
        //console.log(err);
        let song = player.queue.current;

        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Visszaj??tsz??s hiba!")
          .setDescription(`Sikertelen a zene bet??lt??se: \`${song.title}\``)
          .setFooter({
            text: "Hopp??! Valami k??zbel??pett, de nem a te hib??d!",
          });
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })

      .on("trackStuck", (player, err) => {
        this.warn(`Track has an error: ${err.message}`);
        //console.log(err);
        let song = player.queue.current;
        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Zene hiba!")
          .setDescription(`Sikertelen a zene bet??lt??se: \`${song.title}\``)
          .setFooter({
            text: "Hopp??! Valami k??zbel??pett, de nem a te hib??d!",
          });
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })
      .on("playerMove", (player, oldChannel, newChannel) => {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) return;
        const channel = guild.channels.cache.get(player.textChannel);
        if (oldChannel === newChannel) return;
        if (newChannel === null || !newChannel) {
          if (!player) return;
          if (channel)
            channel.send({
              embeds: [
                new MessageEmbed()
                  .setColor(client.config.embedColor)
                  .setDescription(`Kil??pve innen: <#${oldChannel}>`),
              ],
            });
          return player.destroy();
        } else {
          player.voiceChannel = newChannel;
          setTimeout(() => player.pause(false), 1000);
          return undefined;
        }
      })
      .on("playerCreate", (player) =>
        this.warn(
          `Player: ${
            player.options.guild
          } | A wild player has been created in ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        )
      )
      .on("playerDestroy", (player) =>
        this.warn(
          `Player: ${
            player.options.guild
          } | A wild player has been destroyed in ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        )
      )
      // on LOAD_FAILED send error message
      .on("loadFailed", (node, type, error) =>
        this.warn(
          `Node: ${node.options.identifier} | Failed to load ${type}: ${error.message}`
        )
      )
      // on TRACK_START send message
      .on("trackStart", async (player, track) => {
        this.warn(
          `Player: ${
            player.options.guild
          } | Track has been started playing [${colors.blue(track.title)}]`
        );

        let trackStartedEmbed = this.Embed()
          .setAuthor({ name: "??ppen megy", iconURL: this.config.iconURL })
          .setDescription(`[${track.title}](${track.uri})` || "Nincs le??r??s")
          .addField("K??rte", `${track.requester}`, true)
          // show the duration of the track but if it's live say that it's "LIVE" if it's not anumber say it's live, if it's null say it's unknown
          .addField(
            "Hossz",
            track.isStream
              ? `\`??L??\``
              : `\`${prettyMilliseconds(track.duration, {
                  colonNotation: true,
                })}\``,
            true
          );
        try {
          trackStartedEmbed.setThumbnail(
            track.displayThumbnail("maxresdefault")
          );
        } catch (err) {
          trackStartedEmbed.setThumbnail(track.thumbnail);
        }
        let nowPlaying = await client.channels.cache
          .get(player.textChannel)
          .send({
            embeds: [trackStartedEmbed],
            components: [client.createController(player.options.guild)],
          })
          .catch(this.warn);
        player.setNowplayingMessage(nowPlaying);
      })
      .on("trackEnd", async (player, track, playload) => {
        const autoplay = player.get("autoplay");
        if (autoplay === true) {
          /**
           * Array of played songs
           * @type {string[]}
          */
          const psba = player.get("autoplayed") || [];
          const requester = player.get("requester");
          const oldidentifier = player.get("identifier");
          const identifier = player.queue.current.identifier;
          const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
          res = await player.search(search, requester);
          /**
           * Track to add to queue
           * @type {import("erela.js").Track}
          */
          let a;
          for (let i = 0; i < res.tracks.length; i++) {
            const v = res.tracks[i];
 
            // Don't add this track if it's the last 100 played
            if (!v || psba.includes(v.identifier)) continue;
 
            a = v;
            psba.push(a.identifier);
            break;
          }
          if (!a) throw new RangeError("End of playlist");
          player.queue.add(a);
 
          if (psba.length > 100) psba.shift();
          player.set("autoplayed", psba);
        }
      })
      .on("queueEnd", (player) => {
        this.warn(`Player: ${player.options.guild} | Queue has been ended`);
        let queueEmbed = this.Embed()
          .setAuthor({
            name: "A v??r??lista v??get ??rt",
            iconURL: this.config.iconURL,
          })
          .setFooter({ text: "V??r??lista v??get ??rt" })
          .setTimestamp();
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [queueEmbed] });
        // check the config for how much time to wait before disconnecting the bot
        try {
          if (!player.playing && !player.twentyFourSeven) {
            setTimeout(() => {
              if (!player.playing && player.state !== "DISCONNECTED") {
                let disconnectedEmbed = new MessageEmbed()
                  .setColor(this.config.embedColor)
                  .setAuthor({
                    name: "Kil??pve",
                    iconURL: this.config.iconURL,
                  })
                  .setDescription(
                    `A bot inakt??vit??s miatt kil??pett.`
                  );
                client.channels.cache
                  .get(player.textChannel)
                  .send({ embeds: [disconnectedEmbed] });
                player.destroy();
              } else if (player.playing) {
                this.warn(`Player: ${player.options.guild} | Still playing`);
              }
            }, this.config.disconnectTime);
          } else if (player.playing || player.twentyFourSeven) {
            this.warn(
              `Player: ${player.options.guild} | Still playing and 24/7 is active`
            );
          }
        } catch (err) {
          this.warn(err);
        }
      });
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  Embed(text) {
    let embed = new MessageEmbed().setColor(this.config.embedColor);

    if (text) embed.setDescription(text);

    return embed;
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  ErrorEmbed(text) {
    let embed = new MessageEmbed()
      .setColor("RED")
      .setDescription("??? | " + text);

    return embed;
  }

  LoadEvents() {
    let EventsDir = path.join(__dirname, "..", "events");
    fs.readdir(EventsDir, (err, files) => {
      if (err) throw err;
      else
        files.forEach((file) => {
          const event = require(EventsDir + "/" + file);
          this.on(file.split(".")[0], event.bind(null, this));
          this.warn("Event Loaded: " + file.split(".")[0]);
        });
    });
  }

  LoadCommands() {
    let SlashCommandsDirectory = path.join(
      __dirname,
      "..",
      "commands",
      "slash"
    );
    fs.readdir(SlashCommandsDirectory, (err, files) => {
      if (err) throw err;
      else
        files.forEach((file) => {
          let cmd = require(SlashCommandsDirectory + "/" + file);

          if (!cmd || !cmd.run)
            return this.warn(
              "Unable to load Command: " +
                file.split(".")[0] +
                ", File doesn't have an valid command with run function"
            );
          this.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
          this.log("Slash Command Loaded: " + file.split(".")[0]);
        });
    });

    let ContextCommandsDirectory = path.join(
      __dirname,
      "..",
      "commands",
      "context"
    );
    fs.readdir(ContextCommandsDirectory, (err, files) => {
      if (err) throw err;
      else
        files.forEach((file) => {
          let cmd = require(ContextCommandsDirectory + "/" + file);
          if (!cmd.command || !cmd.run)
            return this.warn(
              "Unable to load Command: " +
                file.split(".")[0] +
                ", File doesn't have either command/run"
            );
          this.contextCommands.set(file.split(".")[0].toLowerCase(), cmd);
          this.log("ContextMenu Loaded: " + file.split(".")[0]);
        });
    });
  }

  /**
   *
   * @param {import("discord.js").TextChannel} textChannel
   * @param {import("discord.js").VoiceChannel} voiceChannel
   */
  createPlayer(textChannel, voiceChannel) {
    return this.manager.create({
      guild: textChannel.guild.id,
      voiceChannel: voiceChannel.id,
      textChannel: textChannel.id,
      selfDeafen: this.config.serverDeafen,
      volume: this.config.defaultVolume,
    });
  }

  createController(guild) {
    return new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle("SECONDARY")
        .setCustomId(`controller:${guild}:LowVolume`)
        .setEmoji("????"),

      new MessageButton()
        .setStyle("SUCCESS")
        .setCustomId(`controller:${guild}:Replay`)
        .setEmoji("???"),

      new MessageButton()
        .setStyle("DANGER")
        .setCustomId(`controller:${guild}:PlayAndPause`)
        .setEmoji("???"),

      new MessageButton()
        .setStyle("SUCCESS")
        .setCustomId(`controller:${guild}:Next`)
        .setEmoji("???"),

      new MessageButton()
        .setStyle("SECONDARY")
        .setCustomId(`controller:${guild}:HighVolume`)
        .setEmoji("????")
    );
  }
}

module.exports = DiscordMusicBot;
