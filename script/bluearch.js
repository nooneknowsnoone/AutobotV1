const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "bluearchive",
  version: "1.0.0",
  credits: "Con",
  description: "Fetches a random Blue Archive image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["ba"]
};

module.exports.run = async function ({ api, event }) {
  const messageId = event.messageID;
  const threadId = event.threadID;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/bluearchive?apikey=8062a9eb-2a2e-458b-a1f0-4cd25de8b000`;

  try {
    // Send waiting message
    api.sendMessage("⏳ Fetching a Blue Archive image...", threadId, async (err, info) => {
      if (err) return api.sendMessage("An error occurred while sending the waiting message.", threadId, messageId);

      try {
        // Fetch image
        const response = await axios.get(apiUrl, { responseType: "stream" });

        // Send the image
        return api.sendMessage({
          body: "📸 Here's a Blue Archive image!",
          attachment: response.data
        }, threadId, () => {
          // Delete waiting message after sending
          api.unsendMessage(info.messageID);
        }, messageId);
      } catch (fetchErr) {
        console.error("❌ Failed to fetch Blue Archive image:", fetchErr.message);
        return api.sendMessage("❎ Error: Unable to fetch image. Please try again later.", threadId, messageId);
      }
    });
  } catch (error) {
    console.error("❌ General error:", error.message);
    api.sendMessage(`❎ Unexpected error: ${error.message}`, threadId, messageId);
  }
};