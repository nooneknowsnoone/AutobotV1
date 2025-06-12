const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ninja",
  version: "1.0.0",
  role: 0,
  credits: "dev",
  aliases: [],
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, "cache", `ninja_${Date.now()}.jpg`);

  // Validate image reply
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image to apply the Ninja effect.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(attachment.url);
  const apiUrl = `https://kaiz-apis.gleeze.com/api/ninja?imageUrl=${imageUrl}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    api.sendMessage("🥷 Applying Ninja effect, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Ninja effect applied!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Ninja Effect Error:", error.message);
    api.sendMessage("❌ An error occurred while applying the effect. Please try again later.", threadID, messageID);
  }
};