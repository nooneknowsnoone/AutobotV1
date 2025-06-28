const axios = require("axios");

module.exports.config = {
  name: "poem",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Fetch a random poem!",
  usage: "poem",
  credits: "Ryy",
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  await api.sendMessage("📝 Fetching a poem for you...", threadID, messageID);

  try {
    const res = await axios.get("https://ace-rest-api.onrender.com/api/poem");

    if (!res.data || !res.data.status || !res.data.lines) {
      return api.sendMessage("❌ Couldn't fetch a poem right now.", threadID, messageID);
    }

    const { title, author, lines } = res.data;
    const poemText = lines.join("\n");

    return api.sendMessage(
      `📖 Poem: *${title}*\n👤 Author: ${author}\n\n${poemText}`,
      threadID,
      messageID
    );
  } catch (err) {
    console.error("Poem command error:", err.message);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};