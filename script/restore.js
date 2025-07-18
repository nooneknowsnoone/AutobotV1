const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "restore",
  version: "1.0.0",
  role: 0,
  credits: "dev",
  hasPrefix: true,
  aliases: [],
  usages: "<reply to damaged image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to a damaged or low-quality image.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const apiUrl = `https://rapido.zetsu.xyz/api/restore?imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("🛠️ Restoring the image, please wait...", threadID, messageID);

    const { data } = await axios.get(apiUrl);
    if (!Array.isArray(data) || !data[0]) {
      return api.sendMessage("❌ Restore failed. No image returned.", threadID, messageID);
    }

    const restoredImageUrl = data[0];
    const tempPath = path.join(__dirname, "cache", `restored_${Date.now()}.jpg`);

    const imageRes = await axios.get(restoredImageUrl, { responseType: "arraybuffer" });
    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(imageRes.data, "binary"));

    api.sendMessage({
      body: "✅ Here is your restored image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Restore error:", error?.response?.data || error.message);
    api.sendMessage("❌ Failed to restore the image. Please try again later.", threadID, messageID);
  }
};