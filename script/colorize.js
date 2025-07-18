const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "colorize",
  version: "1.0.0",
  role: 0,
  credits: "dev",
  hasPrefix: true,
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to a image.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const tempPath = path.join(__dirname, 'cache', `colorized_${Date.now()}.jpg`);
  const apiUrl = `https://rapido.zetsu.xyz/api/colorize-image?imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("🎨 Colorizing the image, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Here is your colorized image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Colorize error:", error?.response?.data || error.message);
    api.sendMessage("❌ Failed to colorize the image. Please try again later.", threadID, messageID);
  }
};