const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "1.1.0",
  role: 0,
  credits: "Ry Kayden",
  description: "Search and send Pinterest images by keyword and amount",
  hasPrefix: false,
  aliases: [],
  usage: "pinterest <keyword> - <amount>\nExample: pinterest dog - 6",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const input = args.join(" ").trim();
  if (!input.includes(" - ")) {
    return api.sendMessage("❌ Invalid format.\nUse: pinterest <keyword> - <amount>\nExample: pinterest dog - 6", event.threadID, event.messageID);
  }

  const [keyword, amountText] = input.split(" - ");
  const amount = parseInt(amountText);

  if (!keyword || isNaN(amount) || amount <= 0) {
    return api.sendMessage("❌ Invalid keyword or amount.\nUse: pinterest <keyword> - <amount>", event.threadID, event.messageID);
  }

  if (amount > 50) {
    return api.sendMessage("⚠️ Maximum allowed images is 50. Please use a lower amount.", event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`🔍 Searching Pinterest for "${keyword}" (${amount} images)...`, event.threadID);

    const apiUrl = `https://api-rynx.onrender.com/api/pinterest?q=${encodeURIComponent(keyword)}&amount=${amount}`;
    const response = await axios.get(apiUrl);
    const results = response.data?.results;

    if (!results || results.length === 0) {
      return api.sendMessage(`❌ No results found for "${keyword}".`, event.threadID, event.messageID);
    }

    const imagePaths = [];

    for (let i = 0; i < results.length; i++) {
      const imageUrl = results[i];
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, `pinterest_${event.senderID}_${i}.jpg`);
      fs.writeFileSync(imgPath, imgRes.data);
      imagePaths.push(imgPath);
    }

    const attachments = imagePaths.map(p => fs.createReadStream(p));

    api.sendMessage(
      {
        body: `📌 Pinterest results for: "${keyword}"`,
        attachment: attachments,
      },
      event.threadID,
      () => {
        // Cleanup
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );

  } catch (err) {
    console.error("Pinterest command error:", err);
    api.sendMessage("❌ An error occurred while fetching Pinterest images.", event.threadID);
  }
};