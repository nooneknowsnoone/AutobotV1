const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "santa",
  version: "1.0.0",
  role: 0,
  credits: "dev",
  aliases: [],
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, "cache", `santa_${Date.now()}.gif`);

  // Validate image reply
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("🎅 Please reply to an image to apply the Santa GIF effect.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(attachment.url);
  const apiUrl = `https://kaiz-apis.gleeze.com/api/santa-gif?imageUrl=${imageUrl}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    api.sendMessage("🎁 Creating Santa GIF, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Santa GIF created!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Santa GIF Error:", error.message);
    api.sendMessage("❌ Failed to apply the Santa effect. Please try again later.", threadID, messageID);
  }
};