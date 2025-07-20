const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pinayot",
  version: "1.0.0",
  role: 2,
  hasPrefix: false,
  aliases: ["pyf"],
  description: "Fetch 5 random Pinayot videos per page",
  usage: "pinayot [page]",
  credits: "Ry",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const page = args[0] || 1;
  const url = `https://betadash-api-swordslush-production.up.railway.app/pinayot?page=${page}`;

  try {
    const res = await axios.get(url);
    const data = res.data.result;

    if (!data || data.length === 0) {
      return api.sendMessage("❌ No results found for this page.", event.threadID, event.messageID);
    }

    const limitedResults = data.slice(0, 5); // Get first 5 only
    for (let item of limitedResults) {
      const msg = {
        body: `📹 ${item.description}\n\n📅 Uploaded: ${item.uploadDate}\n🔗 Video: ${item.videoUrl}`,
        attachment: await global.utils.getStreamFromURL(item.thumbnailUrl),
      };
      await api.sendMessage(msg, event.threadID);
    }

    // Optional pagination info
    api.sendMessage(`✅ Displayed 5 results from page ${page}`, event.threadID);
  } catch (error) {
    console.error("Error fetching pinayot data:", error.message);
    api.sendMessage("⚠️ Error fetching data. Please try again later.", event.threadID, event.messageID);
  }
};