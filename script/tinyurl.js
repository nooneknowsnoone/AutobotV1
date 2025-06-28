const axios = require("axios");

module.exports.config = {
  name: "tinyurl",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Shorten a URL using TinyURL.",
  usage: "tinyurl <link>",
  credits: "Ryy",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const link = args[0];

  if (!link) {
    return api.sendMessage("❗ Please provide a URL to shorten.\n\nUsage: tinyurl <link>", threadID, messageID);
  }

  await api.sendMessage("🔗 Shortening your link...", threadID, messageID);

  try {
    const res = await axios.get(`https://ace-rest-api.onrender.com/api/tinyurl?link=${encodeURIComponent(link)}`);

    if (!res.data || !res.data.status || !res.data.result) {
      return api.sendMessage("❌ Failed to shorten the link. Please try again later.", threadID, messageID);
    }

    return api.sendMessage(`✅ Shortened URL:\n${res.data.result}`, threadID, messageID);
  } catch (err) {
    console.error("TinyURL command error:", err.message);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};