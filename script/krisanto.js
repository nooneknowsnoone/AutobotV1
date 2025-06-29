const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "kirisanto",
  version: "1.0.0",
  credits: "Krisantoyab",
  description: "Sends a Kirisanto image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["toyab", "kirido"],
};

module.exports.run = async function ({ api, event, args }) {
  const imageUrl = "https://i.ibb.co/sdJZw4rd/503427576-945848627599224-7830140915761312421-n-jpg-nc-cat-111-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-El-U.jpg";

  try {
    api.sendMessage("🌀 Fetching Kirisanto image...", event.threadID, async () => {
      try {
        const imageRes = await axios.get(imageUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here's your Kirisanto image! 🌌",
          attachment: imageRes.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("Kirisanto Command Error:", err.message);
        return api.sendMessage("❎ Error: Failed to fetch Kirisanto image.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    return api.sendMessage(e.message, event.threadID, event.messageID);
  }
};