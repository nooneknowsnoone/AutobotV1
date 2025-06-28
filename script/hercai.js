const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Ask AI using Hercai API.",
  usage: "hercai <your question>",
  credits: "Ryy",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const question = args.join(" ");

  if (!question) {
    return api.sendMessage("❗ Please provide a question.\n\nUsage: hercai <your question>", threadID, messageID);
  }

  await api.sendMessage("🤖 Thinking...", threadID, messageID);

  try {
    const res = await axios.get(`https://jonell01-ccprojectsapihshs.hf.space/api/hercai?question=${encodeURIComponent(question)}`);

    if (!res.data || !res.data.reply) {
      return api.sendMessage("❌ Failed to get a response from the AI.", threadID, messageID);
    }

    return api.sendMessage(`💬 Question: ${question}\n🧠 Reply: ${res.data.reply}`, threadID, messageID);
  } catch (err) {
    console.error("Hercai command error:", err.message);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};