const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "qrcode",
  version: "1.0.0",
  credits: "developer | converted by you",
  description: "Generates a QR code from the given text.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["qr", "qrgen"],
};

module.exports.run = async function ({ api, event, args }) {
  if (!args || args.length === 0) {
    return api.sendMessage(
      "Please provide the text to generate a QR code.\n\nExample: qrcode hershey",
      event.threadID,
      event.messageID
    );
  }

  const text = args.join(' ');
  const apiUrl = `https://kaiz-apis.gleeze.com/api/qrcode-generator?text=${encodeURIComponent(text)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    api.sendMessage("🔲 Generating your QR code...", event.threadID, async () => {
      try {
        const response = await axios.get(apiUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here's your QR code:",
          attachment: response.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("QR Code Generation Error:", err.message);
        return api.sendMessage("❌ Failed to generate QR code. Please try again.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    return api.sendMessage(e.message, event.threadID, event.messageID);
  }
};