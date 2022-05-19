const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

const command = new SlashCommand()
  .setName("youtube")
  .setDescription("Starts a YouTube Together session")
  .setRun(async (client, interaction, options) => {
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
        .setDescription("Ugyanabban a hívásban kell lenned a bottal!");
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }
    let channel = await client.getChannel(client, interaction);

    fetch(`https://discord.com/api/v9/channels/${channel.id}/invites`, {
      method: "POST",
      body: JSON.stringify({
        max_age: 86400,
        max_uses: 0,
        target_application_id: "880218394199220334",
        target_type: 2,
        temporary: false,
        validate: null,
      }),
      headers: {
        Authorization: `Bot ${client.config.token}`,
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      if (res.status !== 200) {
        console.log(res.status);
        return interaction.reply(
          "Egy hiba következett be a behívó készítése közben. Kérlek próbáld újra később."
        );
      }
      const invite = await res.json();
      const Embed = new MessageEmbed()
        .setAuthor({
          name: "YouTube Together",
          iconURL: "https://cdn.darrennathanael.com/assets/discord/youtube.png",
        })
        //.setAuthor(`YouTube Together`, "https://darrennathanael.com/cdn/youtube.png")
        .setColor(client.config.embedColor)
        .setDescription(`A **YouTube Together** használatával együtt nézhettek YouTube-ot egy hívásban. Kattints a *Csatlakozásra*-ra hogy belépj!
      
      __**[Csatlakozás](https://discord.com/invite/${invite.code})**__

      ⚠ **Figyelem:** Ez csak asztali számítógépen működik.`);
      return interaction.reply({ embeds: [Embed] });
    });
  });

module.exports = command;
