const axios = require('axios');

module.exports.config = {
  name: "bluearchive",
  version: "1.0.0",
  credits: "original by xvi | converted by you",
  description: "Fetch a random Blue Archive image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["ba", "bluea"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    api.sendMessage("🔵 Fetching a Blue Archive image...", event.threadID, async () => {
      try {
        const res = await axios.get('https://xvi-rest-api.vercel.app/api/ba');
        const imageUrl = res.data.url;

        if (!imageUrl) {
          return api.sendMessage("❌ No image received from API.", event.threadID, event.messageID);
        }

        const imageStream = await axios.get(imageUrl, { responseType: 'stream' });

        api.sendMessage({
          body: "Here's your random Blue Archive image!",
          attachment: imageStream.data
        }, event.threadID);
      } catch (err) {
        console.error("bluearchive error:", err);
        api.sendMessage("❌ Failed to retrieve image from Blue Archive API.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    api.sendMessage(e.message, event.threadID, event.messageID);
  }
};