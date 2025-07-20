const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "unsplash",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Search and stream images from Unsplash",
  hasPrefix: true,
  aliases: ["splash"],
  usage: "unsplash <keyword> - <limit>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const input = args.join(" ");
    if (!input.includes(" - ")) {
      return api.sendMessage(
        "❌ Usage: unsplash <keyword> - <limit>\nExample: unsplash dog - 5",
        event.threadID,
        event.messageID
      );
    }

    const [keyword, limit] = input.split(" - ");
    const count = parseInt(limit.trim());

    if (!keyword || isNaN(count) || count < 1 || count > 30) {
      return api.sendMessage(
        "❌ Please provide a valid keyword and a number between 1–30.\nExample: unsplash cat - 10",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      `🔍 Searching Unsplash for "${keyword.trim()}" (${count} images)...`,
      event.threadID
    );

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/unsplash?search=${encodeURIComponent(keyword.trim())}&count=${count}`;
    const response = await axios.get(apiUrl);
    const results = response.data;

    if (!results || results.length === 0) {
      return api.sendMessage(
        `❌ No results found for "${keyword.trim()}".`,
        event.threadID
      );
    }

    const imagePaths = [];

    for (let i = 0; i < Math.min(count, results.length); i++) {
      const imgUrl = results[i].urls.small;
      const imageRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, `unsplash_${i}.jpg`);
      fs.writeFileSync(imgPath, imageRes.data);
      imagePaths.push(imgPath);
    }

    const attachments = imagePaths.map(imgPath => fs.createReadStream(imgPath));

    api.sendMessage(
      {
        body: `📸 Found ${attachments.length} image(s) for "${keyword.trim()}"`,
        attachment: attachments,
      },
      event.threadID,
      () => {
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );
  } catch (error) {
    console.error("Unsplash command error:", error);
    api.sendMessage(
      "❌ An error occurred while fetching or sending the images.",
      event.threadID
    );
  }
};