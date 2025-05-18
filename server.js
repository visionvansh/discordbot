const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers
  ] 
});

const TOKEN = process.env.TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// Welcome message handler
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

app.post("/send-message", async (req, res) => {
  const { channelId, title, titleStyle, description, descriptionStyle, descriptionSize, footer, customFields, buttonLabel, buttonUrl } = req.body;

  const applyStyle = (text, style) => {
    if (!text) return null;
    if (style === "bold") return `**${text}**`;
    if (style === "italic") return `*${text}*`;
    if (style === "bold-italic") return `***${text}***`;
    return text;
  };

  const applySize = (text, size) => {
    if (!text) return null;
    if (size === "normal") return text;
    return `${size} ${text}`;
  };

  const addBullets = (text) => {
    if (!text) return null;
    return text.split("\n").map(line => line.trim() ? `- ${line.trim()}` : "").join("\n");
  };

  const validateAndFormatUrl = (url) => {
    if (!url) return "https://example.com";
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const validatedTitle = typeof title === "string" && title.trim() ? applyStyle(title.slice(0, 256), titleStyle) : "Default Title";
  const validatedDescription = typeof description === "string" && description.trim()
    ? applySize(applyStyle(description, descriptionStyle), descriptionSize)
    : null;
  const validatedFooter = typeof footer === "string" && footer.trim() ? footer : "Default Footer";
  const validatedButtonLabel = typeof buttonLabel === "string" && buttonLabel.trim() ? buttonLabel.slice(0, 80) : "Default Button";
  const validatedButtonUrl = validateAndFormatUrl(buttonUrl);

  try {
    // Validate channelId
    if (!channelId || typeof channelId !== "string") {
      throw new Error("Invalid channel ID provided.");
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error("Channel not found or bot does not have access.");
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle(validatedTitle)
      .setDescription(validatedDescription)
      .setThumbnail("https://example.com/logo.png");

    if (customFields && Array.isArray(customFields)) {
      customFields.forEach(field => {
        if (field.heading && field.value) {
          const styledValue = applySize(applyStyle(addBullets(field.value), field.valueStyle), field.valueSize);
          embed.addFields({ name: field.heading, value: styledValue, inline: false });
        }
      });
    }

    embed.setFooter({ text: validatedFooter });

    const button = new ButtonBuilder()
      .setLabel(validatedButtonLabel)
      .setURL(validatedButtonUrl)
      .setStyle(ButtonStyle.Link)
      .setEmoji("💰");

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);

app.listen(PORT, () => console.log(`🌐 Web UI running on http://localhost:${PORT}`));