const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "bluearchive",
  version: "1.0.0",
  credits: "XVIIII",
  description: "Sends a random Blue Archive image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["baimage", "ba", "blarc"],
};

module.exports.run = async function ({ api, event, args }) {
  const API_URL = 'https://xvi-rest-api.vercel.app/api/ba';

  try {
    api.sendMessage("📥 Fetching a random Blue Archive image...", event.threadID, async () => {
      try {
        const response = await axios.get(API_URL);
        const imageUrl = response.data.url;

        if (!imageUrl) {
          return api.sendMessage("❎ No image found. Please try again later.", event.threadID, event.messageID);
        }

        const imageRes = await axios.get(imageUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "📸 Here's a random Blue Archive image!",
          attachment: imageRes.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("BlueArchive Command Error:", err.message);
        return api.sendMessage("❎ Error: Failed to fetch image.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    return api.sendMessage(e.message, event.threadID, event.messageID);
  }
};