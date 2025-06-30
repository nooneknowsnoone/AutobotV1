const axios = require("axios");

module.exports.config = {
  name: "blowjob",
  version: "1.0.0",
  credits: "Ry",
  description: "Fetches a random Blowjob GIF.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["bj", "nsfwbj"],
  role: 2, // Optional: 2 = admin/vip-only
  category: "nsfw",
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  try {
    api.sendMessage("🔞 Fetching a Blowjob GIF...", threadID, async () => {
      try {
        const res = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4.1", {
          params: {
            ask: "Send a random blowjob GIF",
            uid: senderID,
            apikey: "8062a9eb-2a2e-458b-a1f0-4cd25de8b000"
          }
        });

        const gifUrl = res.data.image || res.data.url || null;
        const caption = res.data.response || "Here's your spicy content! 🔞";

        if (!gifUrl) {
          return api.sendMessage("❌ No GIF found from the API.", threadID, messageID);
        }

        const gifRes = await axios.get(gifUrl, { responseType: "stream" });

        api.sendMessage({
          body: caption,
          attachment: gifRes.data
        }, threadID, messageID);
      } catch (err) {
        console.error("blowjob error:", err);
        api.sendMessage("❌ Failed to fetch NSFW GIF.", threadID, messageID);
      }
    });
  } catch (err) {
    api.sendMessage("❌ Unexpected error occurred.", threadID, messageID);
  }
};