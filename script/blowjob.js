const axios = require("axios");

module.exports.config = {
  name: "blowjob",
  version: "1.0.0",
  role: 2,
  credits: "Ry",
  description: "Fetches a random NSFW Blowjob GIF.",
  hasPrefix: true,
  cooldown: 5,
  aliases: ["bj"]
};

module.exports.run = async function ({ api, event }) {
  const threadId = event.threadID;
  const messageId = event.messageID;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/blowjob?apikey=8062a9eb-2a2e-458b-a1f0-4cd25de8b000`;

  try {
    // Send waiting message
    api.sendMessage("⏳ Fetching a Blowjob GIF...", threadId, async (err, info) => {
      if (err) return api.sendMessage("⚠️ Failed to send the waiting message.", threadId, messageId);

      try {
        // Fetch the GIF
        const response = await axios.get(apiUrl, { responseType: "stream" });

        // Send the GIF
        return api.sendMessage({
          body: "🔞 Here's your NSFW content. Viewer discretion is advised!",
          attachment: response.data
        }, threadId, () => {
          // Delete waiting message
          api.unsendMessage(info.messageID);
        }, messageId);
      } catch (fetchErr) {
        console.error("❌ Failed to fetch GIF:", fetchErr.message);
        return api.sendMessage("❎ Error: Could not retrieve the GIF. Please try again later.", threadId, messageId);
      }
    });
  } catch (err) {
    console.error("❌ General error:", err.message);
    api.sendMessage(`❎ Unexpected error: ${err.message}`, threadId, messageId);
  }
};