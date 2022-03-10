module.exports = {
  token: process.env['token'] || "", //Bot's Token
  clientId: process.env['clientId'] || "", //ID of the bot
  clientSecret: process.env['clientSecret'] || "", //Client Secret of the bot
  port: process.env['PORT'], //Port of the API and Dashboard
  scopes: ["identify", "guilds", "applications.commands"], //Discord OAuth2 Scopes
  serverDeafen: true, //If you want bot to stay deafened
  defaultVolume: 100, //Sets the default volume of the bot, You can change this number anywhere from 1 to 100
  supportServer: "https://discord.gg/sbySMS7m3v", //Support Server Link
  Issues: "https://github.com/SudhanPlayz/Discord-MusicBot/issues", //Bug Report Link
  permissions: 8, //Bot Inviting Permissions
  disconnectTime: 30000, //How long should the bot wait before disconnecting from the voice channel. in miliseconds. set to 1 for instant disconnect.
  alwaysplay: true, // when set to true music will always play no matter if theres no one in voice channel.
  debug: false, //Debug mode
  // Lavalink server; optional public lavalink -> https://lavalink-list.darrennathanael.com/
  // The default one should work fine.
  nodes: [
    {
      identifier: "dpaste", //- Used for indentifier in stats commands.
      host: "losingtime.dpaste.org",
      port: 2124,
      password: "SleepingOnTrains",
      retryAmount: 15, //- The amount of times to retry connecting to the node if connection got dropped.
      retryDelay: 6000, //- Delay between reconnect attempts if connection is lost.
      secure: false, //- Can be either true or false. Only use true if ssl is enabled!
    } /*,
    {
      identifer: "devin-dev",
      host: "lavalink.devin-dev.xyz",
      port: 443,
      password: "lava123",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "devz",
      host: "lavalink.devz.cloud",
      port: 443,
      password: "mathiscool",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "devz 2",
      host: "lavalink2.devz.cloud",
      port: 443,
      password: "mathiscool",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "lavalink-pryam",
      host: "www.lavalink-priyam.ml",
      port: 443,
      password: "methisbigbrain",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "scpcl",
      host: "lavalink.scpcl.site",
      port: 443,
      password: "lvserver",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "mariliun",
      host: "lavalink.mariliun.ml",
      port: 443,
      password: "lavaliun",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    }, 
    {
      identifer: "lavalinkinc",
      host: "lavalinkinc.ml",
      port: 443,
      password: "incognito",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    }, 
    {
      identifer: "lavalinknodepublic",
      host: "www.lavalinknodepublic.ml",
      port: 443,
      password: "mrextinctcodes",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "cobaltonline",
      host: "lavalink.cobaltonline.net",
      port: 443,
      password: "cobaltlavanode23@",
      retryAmount: 15,
      retryDelay: 6000,
      secure: true
    },
    {
      identifer: "lava.link",
      host: "lava.link",
      port: 80,
      password: "123",
      retryAmount: 15,
      retryDelay: 6000,
      secure: false
    },
    {
      identifer: "islantay",
      host: "lavalink.islantay.tk",
      port: 8880,
      password: "waifufufufu",
      retryAmount: 15,
      retryDelay: 6000,
      secure: false
    } */
  ],
  embedColor: "#00f7ff", //Color of the embeds, hex supported
  presence: {
    //PresenceData object | https://discord.js.org/#/docs/main/stable/typedef/PresenceData
    status: "online", // You can have online, idle, and dnd(invisible too but it make people think the bot is offline)
    activities: [
      {
        name: "/help for LAVALINK NODE NOT CONNECTED", //Status Text
        type: "LISTENING", // PLAYING, WATCHING, LISTENING, STREAMING
      },
    ],
  },
  iconURL: "https://raw.githubusercontent.com/PoorLaszlo/2Bot/master/assets/logo.gif", //This icon will be in every embed's author field
};
