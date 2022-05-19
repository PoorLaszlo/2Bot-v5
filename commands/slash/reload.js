const { MessageEmbed, message } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const fs = require("fs");
const path = require("path");

const command = new SlashCommand()
  .setName("reload")
  .setDescription("Reload all commands")
  .setRun(async (client, interaction, options) => {
    if (interaction.user.id === client.config.adminId) {
      try {
        let ContextCommandsDirectory = path.join(__dirname, "..", "context");
        fs.readdir(ContextCommandsDirectory, (err, files) => {
          files.forEach((file) => {
            delete require.cache[
              require.resolve(ContextCommandsDirectory + "/" + file)
            ];
            let cmd = require(ContextCommandsDirectory + "/" + file);
            if (!cmd.command || !cmd.run)
              return this.warn(
                "❌ Sikertelen parancs betöltés: " +
                  file.split(".")[0] +
                  ", A fájlnak nincs command/run metódusa."
              );
            client.contextCommands.set(file.split(".")[0].toLowerCase(), cmd);
          });
        });

        let SlashCommandsDirectory = path.join(__dirname, "..", "slash");
        fs.readdir(SlashCommandsDirectory, (err, files) => {
          files.forEach((file) => {
            delete require.cache[
              require.resolve(SlashCommandsDirectory + "/" + file)
            ];
            let cmd = require(SlashCommandsDirectory + "/" + file);

            if (!cmd || !cmd.run)
              return this.warn(
                "❌ Sikertelen parancs betöltés: " +
                  file.split(".")[0] +
                  ", A fájlnak nincs command/run metódusa."
              );
            client.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
          });
        });

        const totalCmds =
          client.slashCommands.size + client.contextCommands.size;
        client.log(`Sikeresen újratöltve ${totalCmds} db parancs!`);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embedColor)
              .setDescription(`Sikeresen újratöltve \`${totalCmds}\` db parancs!`)
              .setFooter({text: `${client.user.username} újratöltve ${interaction.user.username} álltal`})
              .setTimestamp(),
          ], ephemeral: true
        });
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embedColor)
              .setDescription(
                "Egy hiba lépett közbe. További információ a konzolon."
              ),
          ], ephemeral: true
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setDescription("Nincsen engedélyed a parancs futtatására!"),
        ], ephemeral: true
      });
    }
  });

module.exports = command;