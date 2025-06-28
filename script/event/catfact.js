const axios = require('axios');
const cron = require('node-cron');

let isSending = false;

module.exports.config = {
  name: "catfact",
  version: "1.0.0",
  credits: "Ry",
};

module.exports.handleEvent = function () {
  // No-op to prevent multiple scheduling
};

// Schedule only ONCE globally every hour
cron.schedule('0 * * * *', async () => {
  if (isSending) return;
  isSending = true;

  try {
    const factRes = await axios.get('https://xvi-rest-api.vercel.app/api/catfact');
    const catFact = factRes.data.fact;

    const imageRes = await axios.get('https://kaiz-apis.gleeze.com/api/randomcat?limit=1&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5');
    const imageUrl = imageRes.data.images[0];

    const message = 😺 | CATFACTn\n\${catFact}`;

    const api = global.api || require('somewhere').api; // Replace or inject as needed
    const threads = await api.getThreadList(25, null, ['INBOX']);

    for (const thread of threads) {
      if (thread.isGroup && thread.name !== thread.threadID) {
        const imageStream = await axios({
          method: 'get',
          url: imageUrl,
          responseType: 'stream',
        });

        await api.sendMessage({ body: message, attachment: imageStream.data }, thread.threadID);
      }
    }
  } catch (err) {
    console.error('Error sending hourly cat fact:', err.message);
  } finally {
    isSending = false;
  }
});