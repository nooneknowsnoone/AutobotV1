const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "shotipic",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Send random Shoti images",
  hasPrefix: false,
  aliases: [],
  usage: "[shotipic]",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID } = event;
  const apiUrl = "https://shoti.fbbot.org/api/get-shoti?type=image";
  const headers = {
    apikey: "shoti-e5ea61f538",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/115.0"
  };

  try {
    api.sendMessage("📸 Fetching Shoti images, please wait...", threadID);

    const response = await axios.get(apiUrl, { headers });
    const images = response.data?.result?.content;

    if (!images || images.length === 0) {
      return api.sendMessage("❌ No Shoti images found.", threadID);
    }

    const imagePaths = [];

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const imageRes = await axios.get(url, { responseType: "arraybuffer" });
      const imagePath = path.join(__dirname, `shotipic_${i}.jpg`);
      fs.writeFileSync(imagePath, imageRes.data);
      imagePaths.push(imagePath);
    }

    const attachments = imagePaths.map(img => fs.createReadStream(img));

    api.sendMessage(
      {
        body: `✅ Here ${attachments.length > 1 ? "are your Shoti images!" : "is your Shoti image!"}`,
        attachment: attachments
      },
      threadID,
      () => {
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );
  } catch (error) {
    console.error("ShotiPic Command Error:", error);
    api.sendMessage(
      `❌ Failed to retrieve Shoti images.\nError: ${error.message || error}`,
      threadID
    );
  }
};