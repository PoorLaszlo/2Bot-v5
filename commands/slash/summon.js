const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("summon")
  .setDescription("Summons the bot to the channel.")
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    let node = await client.getLavalink(client);
    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | **Lépj be egy hívásba a parancs lefuttatása előtt!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      player = client.createPlayer(interaction.channel, channel);
      player.connect(true);
    }

    if (channel.id !== player.voiceChannel) {
      player.setVoiceChannel(channel.id);
      player.connect();
    }

    interaction.reply({
      embeds: [
        client.Embed(`:thumbsup: | **Sikeresen belépve a <#${channel.id}> hívásba!**`),
      ],
    });
  });

module.exports = command;
