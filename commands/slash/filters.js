const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("filters")
  .setDescription("add or remove filters")
  .addStringOption((option) =>
    option
      .setName("preset")
      .setDescription("the preset to add")
      .setRequired(true)
      .addChoice("Nightcore", "nightcore")
      .addChoice("BassBoost", "bassboost")
      .addChoice("Vaporwave", "vaporwave")
      .addChoice("Pop", "pop")
      .addChoice("Soft", "soft")
      .addChoice("Treblebass", "treblebass")
      .addChoice("Eight Dimension", "eightD")
      .addChoice("Karaoke", "karaoke")
      .addChoice("Vibrato", "vibrato")
      .addChoice("Tremolo", "tremolo")
      .addChoice("Reset", "off")
  )

  .setRun(async (client, interaction, options) => {
    const args = interaction.options.getString("preset");

    let player = client.manager.players.get(interaction.guild.id);

    if (!player) {
      const queueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription("❌ | Nem megy éppen zene a szerveren!");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | Lépj be egy hívásba a parancs lefuttatása előtt!"
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
          "❌ | Ugyanabban a hívásban kell lenned a bottal!"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    // create a new embed
    let thing = new MessageEmbed().setColor(client.config.embedColor);

    if (args == "nightcore") {
      thing.setDescription("✅ | Nightcore filter bekapcsolva!");
      player.nightcore = true;
    } else if (args == "bassboost") {
      thing.setDescription("✅ | BassBoost filter bekapcsolva!");
      player.bassboost = true;
    } else if (args == "vaporwave") {
      thing.setDescription("✅ | Vaporwave filter bekapcsolva!");
      player.vaporwave = true;
    } else if (args == "pop") {
      thing.setDescription("✅ | Pop filter bekapcsolva!");
      player.pop = true;
    } else if (args == "soft") {
      thing.setDescription("✅ | Soft filter bekapcsolva!");
      player.soft = true;
    } else if (args == "treblebass") {
      thing.setDescription("✅ | Treblebass filter bekapcsolva!");
      player.treblebass = true;
    } else if (args == "eightD") {
      thing.setDescription("✅ | Eight Dimension filter bekapcsolva!");
      player.eightD = true;
    } else if (args == "karaoke") {
      thing.setDescription("✅ | Karaoke filter bekapcsolva!");
      player.karaoke = true;
    } else if (args == "vibrato") {
      thing.setDescription("✅ | Vibrato filter bekapcsolva!");
      player.vibrato = true;
    } else if (args == "tremolo") {
      thing.setDescription("✅ | Tremolo filter bekapcsolva!");
      player.tremolo = true;
    } else if (args == "off") {
      thing.setDescription("✅ | EQ kitörölve!");
      player.reset();
    } else {
      thing.setDescription("❌ | Helytelen filter!");
    }

    return interaction.reply({ embeds: [thing] });
  });

module.exports = command;
