const axios = require('axios');

module.exports.config = {
  name: "rewrite",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Rewrite a paragraph using the Zen API.",
  usage: "rewriter <text>",
  credits: "Developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  const query = args.join(' ');

  if (!query) {
    return send(
      "Please provide a paragraph to rewrite.\nExample: rewriter Love is a complex and multifaceted emotion..."
    );
  }

  try {
    const apiUrl = `https://zen-api.gleeze.com/api/rewrite-article?text=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || typeof data !== 'string') {
      return send("Error: Unexpected response from Zen API.");
    }

    send("Rewritten Article:\n" + data);

  } catch (error) {
    console.error('rewriter command error:', error.message);
    send("Error: Failed to connect to Zen API.");
  }
};