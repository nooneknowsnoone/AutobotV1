const axios = require("axios");

module.exports.config = {
  name: "shotipic",
  version: "1.0.0",
  credits: "Ry",
  description: "Fetches random Shoti images from the API.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["shotiimg", "shotirand"]
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const apiKey = "$shoti-54c9a5966a";
  const apiUrl = `https://shoti.fbbot.org/api/get-shoti?type=image&apikey=${apiKey}`;

  try {
    api.sendMessage("📸 Fetching Shoti images...", threadID, async () => {
      try {
        const res = await axios.get(apiUrl);
        const result = res.data?.result?.content;

        if (!Array.isArray(result) || result.length === 0) {
          return api.sendMessage("❌ No images found from Shoti.", threadID, messageID);
        }

        for (const url of result) {
          const imgRes = await axios.get(url, { responseType: "stream" });
          await api.sendMessage({
            attachment: imgRes.data
          }, threadID);
        }
      } catch (error) {
        console.error("❌ Shoti fetch error:", error.message);
        api.sendMessage("❎ Failed to retrieve images from Shoti API.", threadID, messageID);
      }
    });
  } catch (err) {
    api.sendMessage(err.message, threadID);
  }
};