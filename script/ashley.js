const axios = require('axios');

module.exports.config = {
  name: "ashley",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a spicy reply from Ashley AI.",
  usage: "ashley <message>",
  credits: "Ry Dev",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      "Error: Please provide a prompt.\nExample: ashley hi",
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://markdevs-last-api-p2y6.onrender.com/ashley?prompt=${encodeURIComponent(query)}&uid=${senderID}`;
    const { data } = await axios.get(apiUrl);

    if (!data.response) {
      return api.sendMessage(
        "Error: No response from Ashley.",
        threadID,
        messageID
      );
    }

    const message = `Ashley [SPG]:\n${data.response}`;
    return api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("ashley command error:", error.message);
    return api.sendMessage(
      "Error: Could not reach Ashley API.",
      threadID,
      messageID
    );
  }
};