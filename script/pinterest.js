const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "Kayden",
  description: "Searches and streams images from Pinterest",
  hasPrefix: true,
  aliases: ["pin"],
  usage: "pinterest <keyword> - <limit>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const input = args.join(" ");
    if (!input.includes(" - ")) {
      return api.sendMessage(
        "❌ Usage: pinterest <keyword> - <limit>\nExample: pinterest cat - 5",
        event.threadID,
        event.messageID
      );
    }

    const [keyword, limit] = input.split(" - ");
    const count = parseInt(limit.trim());

    if (!keyword || isNaN(count) || count < 1 || count > 30) {
      return api.sendMessage(
        "❌ Please provide a valid keyword and a number between 1–30.\nExample: pinterest anime - 10",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      `🔍 Searching Pinterest for "${keyword.trim()}" (${count} images)...`,
      event.threadID
    );

    const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/pin?title=${encodeURIComponent(keyword.trim())}&count=${count}`;
    const response = await axios.get(apiUrl);
    const images = response.data.data;

    if (!images || images.length === 0) {
      return api.sendMessage(
        `❌ No results found for "${keyword.trim()}".`,
        event.threadID
      );
    }

    const imagePaths = [];

    for (let i = 0; i < Math.min(count, images.length); i++) {
      const url = images[i];
      const imageRes = await axios.get(url, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, `pin_${i}.jpg`);
      fs.writeFileSync(imgPath, imageRes.data);
      imagePaths.push(imgPath);
    }

    const attachments = imagePaths.map(imgPath => fs.createReadStream(imgPath));

    api.sendMessage(
      {
        body: `✅ Here are ${attachments.length} result(s) for "${keyword.trim()}"`,
        attachment: attachments,
      },
      event.threadID,
      () => {
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );
  } catch (error) {
    console.error("Pinterest command error:", error);
    api.sendMessage(
      "❌ An error occurred while fetching or sending the images.",
      event.threadID
    );
  }
};