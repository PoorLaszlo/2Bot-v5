const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");
require("moment-duration-format");
const { MessageEmbed } = require("discord.js");
const os = require("os");

const command = new SlashCommand()
  .setName("stats")
  .setDescription("Get information about the bot")
  .setRun(async (client, interaction) => {
    // get OS info
    const osver = os.platform() + " " + os.release();
    const oscpu = os.cpus()[0].model;
    const oscputhreads = os.cpus().length;
    const oscpucores = oscputhreads / 2;
    // Get nodejs version
    const nodeVersion = process.version;
    const { version } = require("discord.js");
    // get the uptime in a human readable format
    const runtime = moment
      .duration(client.uptime)
      .format("d[ Nap]・h[ Óra]・m[ Perc]・s[ Másodperc]");
    // show lavalink uptime in a nice format
    const lavauptime = moment
      .duration(client.manager.nodes.values().next().value.stats.uptime)
      .format(" d[ Nap]・h[ Óra]・m[ Perc]");
    // show lavalink memory usage in a nice format
    const lavaram = (
      client.manager.nodes.values().next().value.stats.memory.used /
      1024 /
      1024
    ).toFixed(2);
    const lavacpuusage = (client.manager.nodes.values().next().value.stats.cpu.systemLoad * 100).toFixed(2);
    const lavacpucores = client.manager.nodes.values().next().value.stats.cpu.cores;
    // sow lavalink memory alocated in a nice format
    const lavamemalocated = (
      client.manager.nodes.values().next().value.stats.memory.allocated /
      1024 /
      1024
    ).toFixed(2);
    // show system uptime
    var sysuptime = moment
      .duration(os.uptime() * 1000)
      .format("d[ Nap]・h[ Óra]・m[ Perc]・s[ Másodperc]");

    // get commit hash and date
    let gitHash = "";
    try {
      gitHash = require("child_process")
        .execSync("git rev-parse HEAD")
        .toString()
        .trim();
    } catch (e) {
      // do nothing
      gitHash = "-";
    }

    const statsEmbed = new MessageEmbed()
      .setTitle(`${client.user.username} Információ`)
      .setColor(client.config.embedColor)
      .setDescription(
        `\`\`\`yml\nNév: ${client.user.username}#${client.user.discriminator} [${client.user.id}]\nAPI: ${client.ws.ping}ms\nFutási idő: ${runtime}\`\`\``
      )
      .setFields([
        {
          name: `Lavalink statisztikák`,
          value: `\`\`\`yml\nCPU: Ismeretlen | ${lavacpucores} Mag\nCPU Terhelés: ${lavacpuusage}%\nFutási idő: ${lavauptime}\nRAM: ${lavaram} / ${lavamemalocated} MB\nKliensek: ${
            client.manager.nodes.values().next().value.stats.playingPlayers
          } / ${
            client.manager.nodes.values().next().value.stats.players
          }\`\`\``,
          inline: true,
        },
        {
          name: "2Bot statisztikák",
          value: `\`\`\`yml\nSzerverek: ${
            client.guilds.cache.size
          } \nNodeJS: ${nodeVersion}\nDiscord.js: v${version}\n2Bot: v${
            require("../../package.json").version
          } \`\`\``,
          inline: true,
        },
        {
          name: "Rendszer statisztikák",
          value: `\`\`\`yml\nCPU: ${oscpu} | ${oscpucores} Mag / ${oscputhreads} Szál\nOS: ${osver}\nFutási idő: ${sysuptime}\n\`\`\``,
          inline: false,
        },
      ])
      .setFooter({ text: `Build: ${gitHash}` });
    return interaction.reply({ embeds: [statsEmbed], ephemeral: false });
  });

module.exports = command;
