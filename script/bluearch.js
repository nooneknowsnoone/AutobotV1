const axios = require('axios');

module.exports.config = {
  name: "bluearchive",
  version: "1.0.0",
  credits: "Ru",
  description: "Fetches a random Blue Archive image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["ba", "blarch"],
};

module.exports.run = async function ({ api, event, args }) {
  const API_URL = 'https://kaiz-apis.gleeze.com/api/bluearchive';
  const API_KEY = 'bbcc44b9-4710-41c7-8034-fa2000ea7ae5';

  try {
    api.sendMessage("📦 Fetching a random Blue Archive image...", event.threadID, async () => {
      try {
        const res = await axios.get(API_URL, {
          params: { apikey: API_KEY }
        });

        const imageUrl = res.data.imageUrl || res.data.url || res.data.image;

        if (!imageUrl) {
          return api.sendMessage("❎ No image received. Please try again later.", event.threadID, event.messageID);
        }

        const imageStream = await axios.get(imageUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here's a random Blue Archive image for you! 🩵",
          attachment: imageStream.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("BlueArchive Command Error:", err.message);
        return api.sendMessage("❎ Error: Couldn't fetch image from Blue Archive API.", event.threadID, event.messageID);
      }
    });
  } catch (err) {
    return api.sendMessage(`❎ Unexpected error: ${err.message}`, event.threadID, event.messageID);
  }
};