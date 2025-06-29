const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "restore",
  version: "1.0.0",
  role: 0,
  credits: "Ryy",
  aliases: [],
  usages: "< reply to old photo >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, "cache", `restored_${Date.now()}.jpg`);

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an old or damaged photo.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  try {
    api.sendMessage("🛠️ Restoring photo, please wait...", threadID, messageID);

    const response = await axios({
      method: 'POST',
      url: 'https://ai-powered-photo-restoration.p.rapidapi.com/',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'ai-powered-photo-restoration.p.rapidapi.com',
        'x-rapidapi-key': '55a192bae2msh0d2f5a5b56dfbc3p1bd1b3jsn3fd826d5a4b4',
      },
      data: {
        pictures_url: attachment.url
      }
    });

    const restoredImageURL = response.data.url;
    const imageBuffer = await axios.get(restoredImageURL, { responseType: "arraybuffer" });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(imageBuffer.data, "binary"));

    api.sendMessage({
      body: "✅ Photo restored successfully!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Restore Command Error:", error.message);
    api.sendMessage("❌ An error occurred while restoring the photo.", threadID, messageID);
  }
};