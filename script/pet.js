const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "pet",
  version: "1.0.0",
  role: 0,
  credits: "dev",
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  // Check if user replied to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image first.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const tempPath = path.join(__dirname, 'cache', `pet_${Date.now()}.gif`);
  const apiUrl = `https://api.popcat.xyz/v2/pet?image=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("⌛ Creating pet effect, please wait...", threadID, messageID);

    // Download the "pet" gif as arraybuffer
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    // Ensure cache folder exists and save the gif
    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    // Send the pet gif back and clean temp file
    api.sendMessage({
      body: "✅ Here is your pet gif!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Error creating pet gif:", error);
    api.sendMessage("❌ An error occurred while creating the pet gif. Please try again later.", threadID, messageID);
  }
};