const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ghibli",
  version: "1.0.0",
  role: 0,
  credits: "dev",
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
  const tempPath = path.join(__dirname, 'cache', `ghibli_${Date.now()}.jpg`);
  const apiUrl = `https://kaiz-apis.gleeze.com/api/img2ghibli?imageUrl=${encodeURIComponent(imageUrl)}&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633`;

  try {
    api.sendMessage("🎨 Transforming into Ghibli style, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Here's your Ghibli-style image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Error generating Ghibli image:", error);
    api.sendMessage("❌ An error occurred while transforming the image. Please try again later.", threadID, messageID);
  }
};