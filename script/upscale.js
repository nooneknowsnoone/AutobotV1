const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "upscale",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  hasPrefix: true,
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image first.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const tempPath = path.join(__dirname, 'cache', `upscale_${Date.now()}.jpg`);
  const apiUrl = `https://rapido.zetsu.xyz/api/upscale-image?imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("🔄 Upscaling image, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Here is your upscaled image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Upscale error:", error?.response?.data || error.message);
    api.sendMessage("❌ Failed to upscale the image. Please try again later.", threadID, messageID);
  }
};