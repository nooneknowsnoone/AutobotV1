const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "4k",
  version: "1.0.0",
  role: 0,
  credits: "Jieunn", 
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, 'cache', `4k_${Date.now()}.jpg`);

  // Check if the user replied to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image to enhance it to 4K.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const apiUrl = `https://www.smfahim.xyz/4k?url=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("⏳ Enhancing image to 4K, please wait...", threadID, messageID);

    const res = await axios.get(apiUrl);
    if (res.data.status && res.data.image) {
      const enhancedUrl = res.data.image;

      // Download the enhanced image
      const imageBuffer = await axios.get(enhancedUrl, { responseType: 'arraybuffer' });
      fs.ensureDirSync(path.dirname(tempPath));
      fs.writeFileSync(tempPath, Buffer.from(imageBuffer.data, 'binary'));

      api.sendMessage({
        body: "✅ Here is your 4K enhanced image!",
        attachment: fs.createReadStream(tempPath)
      }, threadID, () => fs.unlinkSync(tempPath), messageID);
    } else {
      api.sendMessage("❌ Failed to enhance image.", threadID, messageID);
    }

  } catch (error) {
    console.error("❌ Error enhancing image:", error.message);
    api.sendMessage("❌ An error occurred while enhancing the image. Please try again later.", threadID, messageID);
  }
};