const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "communism",
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

  // Validate image reply
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image first.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const tempPath = path.join(__dirname, 'cache', `communism_${Date.now()}.jpg`);
  const apiUrl = `https://api.popcat.xyz/v2/communism?image=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("🛠️ Applying communism filter, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "☭ Here is your communist masterpiece!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Error applying communism filter:", error);
    api.sendMessage("❌ Failed to apply the filter. Try again later.", threadID, messageID);
  }
};