const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autoplay")
  .setDescription("Autoplay music toggle")
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
        embeds: [
          client.ErrorEmbed(
            "Adj hozzá egy zenét a listához az automatikus lejátszás engedélyezéséhez!"
          ),
        ],
      });
    }

    await interaction.deferReply();

    const autoplay = player.get("autoplay");

    if (autoplay !== true) {
      const identifier = player.queue.current.identifier;

      player.set("autoplay", true);
      player.set("requester", interaction.user);
      player.set("identifier", identifier);
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      res = await player.search(search, interaction.user);
      const psba = player.get("autoplayed") || [];
      const r = res.tracks[1];
      for (const a of [identifier, r?.identifier]) {
        if (a && !psba.includes(a)) psba.push(a);
      }
      if (r) player.queue.add(r);
      while (psba.length > 100) psba.shift();
      player.set("autoplayed", psba);

      let embed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(`Automatikus lejátszás \`bekapcsolva\``);

      return interaction.editReply({ embeds: [embed] });
    } else {
      player.set("autoplay", false);
      player.queue.clear();

      let embed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(`Automatikus lejátszás \`kikapcsolva\``);

      return interaction.editReply({ embeds: [embed] });
    }
  });

module.exports = command;