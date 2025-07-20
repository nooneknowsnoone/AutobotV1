const axios = require("axios");

module.exports.config = {
  name: "pinayot",
  version: "1.0.0",
  role: 0,
  credits: "Rye",
  description: "Fetch videos from Pinayot by page number",
  commandCategory: "Media",
  usages: "pinayot <page>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const page = args[0] || 1;
    const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/pinayot?page=${page}`);
    const { result, author } = res.data;

    if (!result || result.length === 0) return api.sendMessage("❌ No results found.", event.threadID, event.messageID);

    let msgList = [];

    for (const item of result) {
      const message = {
        body: `🎬 ${item.description}\n📅 Upload Date: ${item.uploadDate}\n🌐 Source: ${author}\n🔗 Direct: ${item.videoUrl}`,
        attachment: await global.utils.getStreamFromURL(item.thumbnailUrl)
      };
      msgList.push(message);
    }

    for (const msg of msgList) {
      await api.sendMessage(msg, event.threadID);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ An error occurred while fetching data.", event.threadID, event.messageID);
  }
};