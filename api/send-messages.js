const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (req, res) => {
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
    if (!channelId || typeof channelId !== "string") {
      throw new Error("Invalid channel ID provided.");
    }

    const channel = await global.discordClient.channels.fetch(channelId);
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
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};