const axios = require('axios');

module.exports.config = {
  name: 'shorten',
  version: '1.0.0',
  role: 0,
  aliases: ['shorturl', 'short'],
  description: 'Shorten a URL using Akuari Shorten API',
  usage: '<url>',
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) {
    return api.sendMessage(
      "❌ Please provide a URL to shorten. Usage: shorten <url>",
      threadID,
      messageID
    );
  }

  const customId = Math.random().toString(36).substring(2, 10);
  const apiUrl = `https://s.akuari.my.id/shorten?url=${encodeURIComponent(url)}&customid=${customId}`;

  api.sendMessage(
    '⌛ Shortening your URL, please wait...',
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data && data.shortenedUrl) {
          api.sendMessage(
            `✅ Shortened URL:\n${data.shortenedUrl}`,
            threadID,
            messageID
          );
        } else {
          api.editMessage(
            "❌ Failed to shorten the URL. Please try again later.",
            info.messageID
          );
        }
      } catch (error) {
        console.error("❌ Error shortening URL:", error.response?.data || error.message);
        api.editMessage(
          "❌ An error occurred while shortening the URL.",
          info.messageID
        );
      }
    }
  );
};