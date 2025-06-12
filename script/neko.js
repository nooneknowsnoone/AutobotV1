const axios = require('axios');

const API_BASE = 'https://kaiz-apis.gleeze.com/api';
const API_KEY = '8062a9eb-2a2e-458b-a1f0-4cd25de8b000';

module.exports.config = {
  name: "neko",
  version: "1.0.0",
  credits: "Original Developer",
  description: "Fetches a random Neko image.",
  hasPrefix: false,
  cooldown: 3,
  aliases: ["nekopic"]
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const res = await axios.get(`${API_BASE}/neko`, {
      params: { apikey: API_KEY }
    });

    const imageUrl = res.data?.imageUrl;

    if (!imageUrl) {
      return api.sendMessage("❎ No neko image found. Please try again.", event.threadID, event.messageID);
    }

    return api.sendMessage({
      body: "Here’s a random neko for you!",
      attachment: await axios.get(imageUrl, { responseType: 'stream' })
    }, event.threadID, event.messageID);

  } catch (error) {
    console.error("Neko command error:", error.message);
    return api.sendMessage("❎ Error: Failed to fetch neko image.", event.threadID, event.messageID);
  }
};