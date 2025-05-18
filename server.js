const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers
  ] 
});

global.discordClient = client;

const TOKEN = process.env.TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

client.on("guildMemberAdd", async (member) => {
  try {
    const welcomeChannel = await client.channels.fetch(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) {
      console.error("Welcome channel not found!");
      return;
    }

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setDescription("We’re here to break the matrix and rewrite the rules—earning big by editing and posting. No limits, no excuses—just pure hustle and success. Let’s make it happen! 💰")
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: "Clipify Post App" })
      .setTimestamp();

    await welcomeChannel.send({ 
      content: `Welcome to Clipify Post, ${member}! 🚀`, 
      embeds: [welcomeEmbed] 
    });
  } catch (err) {
    console.error("Error sending welcome message:", err);
  }
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing Discord client...");
  client.destroy();
  process.exit(0);
});