const axios = require('axios');

module.exports.config = {
  name: "law",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a law from the 48 Laws of Power.",
  usage: "law <number>",
  credits: "Developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  const number = args[0];

  if (!number || isNaN(number) || number < 1 || number > 48) {
    return send(
      "Please provide a valid law number between 1 and 48.\nExample: law 1"
    );
  }

  try {
    const apiUrl = `https://haji-mix.up.railway.app/api/law?number=${number}&apikey=aafe0d9d17114eb257c6b98a02a6047cf0f7e4f5cd956515f2d3f295e8fb8b56`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.title || !data.law) {
      return send("Error: No law found or invalid response from the API.");
    }

    return send(`Law #${data.code}: ${data.title}\n\n"${data.law}"`);

  } catch (error) {
    console.error('law command error:', error.message);
    send("Error: Failed to retrieve law from the API.");
  }
};