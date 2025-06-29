const axios = require('axios');

module.exports.config = {
  name: 'quote',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['inspire', 'quotes'],
  description: 'Fetch a random inspirational quote.',
  usage: 'quote',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  api.sendMessage('⌛ Fetching inspirational quote...', threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get('https://rapido.zetsu.xyz/api/quote');

      if (data && data.quote) {
        const message = `🌟 𝗤𝘂𝗼𝘁𝗲:\n"${data.quote}"\n\n— ${data.author || 'Unknown'}`;
        return api.editMessage(message, info.messageID);
      } else {
        throw new Error('Invalid API response');
      }

    } catch (error) {
      console.error('quote command error:', error.message);
      return api.editMessage('❌ Error: Unable to fetch quote.', info.messageID);
    }
  });
};