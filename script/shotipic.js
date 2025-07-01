const axios = require("axios");

module.exports.config = {
  name: "shotipic",
  version: "1.0.0",
  credits: "Ry",
  description: "Fetch a random Shoti image from PH region.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["shotiimg", "shotiph"]
};

module.exports.run = async function ({ api, event }) {
  const threadId = event.threadID;
  const messageId = event.messageID;
  const apiUrl = `https://shoti.fbbot.org/api/get-shoti?type=image&apikey=$shoti-54c9a5966a`;

  try {
    // Send loading message
    api.sendMessage("📸 Fetching Shoti image from PH region...", threadId, async (err, info) => {
      if (err) return api.sendMessage("⚠️ Couldn't send loading message.", threadId, messageId);

      try {
        // Fetch image URLs
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (data.code !== 200 || !data.result?.content?.length) {
          return api.sendMessage("❌ Failed to fetch Shoti image.", threadId, messageId);
        }

        // Pick random image from content list
        const randomImg = data.result.content[Math.floor(Math.random() * data.result.content.length)];
        const imageStream = await axios.get(randomImg, { responseType: "stream" });

        return api.sendMessage({
          body: `👤 User: ${data.result.user?.username || "Unknown"}`,
          attachment: imageStream.data
        }, threadId, () => {
          api.unsendMessage(info.messageID);
        }, messageId);
      } catch (fetchErr) {
        console.error("❌ Error fetching image:", fetchErr.message);
        return api.sendMessage("❎ Error: Could not load image. Try again later.", threadId, messageId);
      }
    });
  } catch (err) {
    console.error("❌ General error:", err.message);
    api.sendMessage(`❎ Unexpected error: ${err.message}`, threadId, messageId);
  }
};