const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pexel",
  version: "1.0.0",
  role: 0,
  credits: "Ry Kayden",
  description: "Search and send Pexels images by keyword",
  hasPrefix: false,
  aliases: [],
  usage: "pexel <keyword>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ").trim();
  if (!keyword) {
    return api.sendMessage("❌ Please provide a search keyword.\nExample: pexel dog", event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`🔍 Searching for "${keyword}" on Pexels...`, event.threadID);

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/image?search=${encodeURIComponent(keyword)}`;
    const response = await axios.get(apiUrl);
    const images = response.data?.images;

    if (!images || images.length === 0) {
      return api.sendMessage(`❌ No results found for "${keyword}".`, event.threadID);
    }

    const imagePaths = [];

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const imageRes = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `pexel_${i}.jpg`);
      fs.writeFileSync(filePath, imageRes.data);
      imagePaths.push(filePath);
    }

    const attachments = imagePaths.map(img => fs.createReadStream(img));

    api.sendMessage(
      {
        body: `📸 Pexels search results for: "${keyword}"`,
        attachment: attachments
      },
      event.threadID,
      () => {
        // Cleanup
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );

  } catch (error) {
    console.error("Pexel command error:", error);
    api.sendMessage("❌ An error occurred while retrieving the images.", event.threadID);
  }
};