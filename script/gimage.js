const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "gimage",
  version: "1.0.0",
  role: 0,
  credits: "Ry Kayden",
  description: "Search and send Google-style images by keyword and count",
  hasPrefix: false,
  aliases: ["googleimg", "imgsearch"],
  usage: "gimage <keyword> - <count>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const input = args.join(" ").trim();
  if (!input.includes(" - ")) {
    return api.sendMessage("❌ Usage: gimage <keyword> - <count>\nExample: gimage dog - 5", event.threadID, event.messageID);
  }

  const [rawQuery, rawCount] = input.split(" - ");
  const keyword = rawQuery.trim();
  const count = parseInt(rawCount.trim());

  if (!keyword || isNaN(count) || count < 1 || count > 15) {
    return api.sendMessage("❌ Please enter a valid keyword and a number between 1–15.\nExample: gimage cat - 5", event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`🔎 Searching ${count} image(s) for "${keyword}"...`, event.threadID);

    const apiUrl = `https://jerome-web.gleeze.com/service/api/gimage?query=${encodeURIComponent(keyword)}&count=${count}`;
    const response = await axios.get(apiUrl);
    const images = response.data;

    if (!Array.isArray(images) || images.length === 0) {
      return api.sendMessage(`❌ No images found for "${keyword}".`, event.threadID);
    }

    const imagePaths = [];

    for (let i = 0; i < Math.min(count, images.length); i++) {
      const url = images[i].url;
      const imageRes = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `gimage_${i}.jpg`);
      fs.writeFileSync(filePath, imageRes.data);
      imagePaths.push(filePath);
    }

    const attachments = imagePaths.map(p => fs.createReadStream(p));

    api.sendMessage(
      {
        body: `📷 Google-style results for "${keyword}" (${attachments.length} image${attachments.length > 1 ? "s" : ""})`,
        attachment: attachments
      },
      event.threadID,
      () => {
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );

  } catch (error) {
    console.error("gimage command error:", error);
    api.sendMessage("❌ An error occurred while retrieving images.", event.threadID);
  }
};