const axios = require("axios");

module.exports.config = {
  name: "pinayot",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Fetch 5 random Pinayot videos per page",
  usage: "pinayot [page]",
  credits: "Jayy x ChatGPT",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const page = parseInt(args[0]) || 1;
  const url = `https://betadash-api-swordslush-production.up.railway.app/pinayot?page=${page}`;

  try {
    const res = await axios.get(url);
    const data = res.data?.result;

    if (!data || data.length === 0) {
      return api.sendMessage(`❌ Walang video sa page ${page}.`, event.threadID, event.messageID);
    }

    let count = 0;

    for (const video of data.slice(0, 5)) {
      const message = {
        body:
          `🎬 ${video.description}\n` +
          `📅 ${video.uploadDate}\n` +
          `🔗 [Watch Direct](${video.videoUrl})\n` +
          `📥 Iframe: ${video.iframeUrl}`,
        attachment: await global.utils.getStreamFromURL(video.thumbnailUrl),
      };

      await api.sendMessage(message, event.threadID);
      count++;
    }

    // Footer message
    api.sendMessage(`✅ Ipinakita ang ${count} video sa Page ${page}. Gamitin ang "pinayot ${page + 1}" para sa susunod.`, event.threadID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Error fetching data from server.", event.threadID, event.messageID);
  }
};