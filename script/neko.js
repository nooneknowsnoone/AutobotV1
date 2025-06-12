const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "neko",
  version: "1.0.0",
  credits: "original by kaiz | converted by you",
  description: "Fetches a random Neko image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["nekopic", "nekogirl"],
};

module.exports.run = async function ({ api, event, args }) {
  const API_BASE = 'https://kaiz-apis.gleeze.com/api';
  const API_KEY = '8062a9eb-2a2e-458b-a1f0-4cd25de8b000';

  try {
    api.sendMessage("😺 Fetching a random neko image...", event.threadID, async () => {
      try {
        const response = await axios.get(`${API_BASE}/neko`, {
          params: { apikey: API_KEY }
        });

        const imageUrl = response.data.imageUrl;
        if (!imageUrl) {
          return api.sendMessage("❎ No neko image found. Please try again.", event.threadID, event.messageID);
        }

        const imageRes = await axios.get(imageUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here's a random neko for you! 😽",
          attachment: imageRes.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("Neko Command Error:", err.message);
        return api.sendMessage("❎ Error: Failed to fetch neko image.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    return api.sendMessage(e.message, event.threadID, event.messageID);
  }
};