const axios = require("axios");

module.exports.config = {
  name: "bluearchive",
  version: "1.0.0",
  credits: "Ry",
  description: "Fetches a random Blue Archive image.",
  hasPrefix: false,
  cooldown: 3,
  aliases: ["ba", "archive"],
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  try {
    api.sendMessage("📥 Fetching a random Blue Archive image...", threadID, async () => {
      try {
        const res = await axios.get("https://kaiz-apis.gleeze.com/api/bluearchive", {
          params: {
            ask: "Send me a random Blue Archive image.",
            uid: senderID,
            apikey: "8062a9eb-2a2e-458b-a1f0-4cd25de8b000"
          }
        });

        const imageUrl = res.data.image || res.data.url || null;
        const caption = res.data.response || "🎴 Here's your Blue Archive image!";

        if (!imageUrl) {
          return api.sendMessage("❌ No image found from the API.", threadID, messageID);
        }

        const imageRes = await axios.get(imageUrl, { responseType: "stream" });

        api.sendMessage({
          body: caption,
          attachment: imageRes.data
        }, threadID, messageID);
      } catch (err) {
        console.error("bluearchive error:", err);
        api.sendMessage("❌ Failed to fetch Blue Archive image.", threadID, messageID);
      }
    });
  } catch (err) {
    api.sendMessage("❌ Unexpected error occurred.", threadID, messageID);
  }
};
