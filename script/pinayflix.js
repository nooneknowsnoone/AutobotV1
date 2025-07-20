const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
  name: "pinayot",
  version: "2.0.0",
  role: 0,
  description: "Fetch multiple Pinay videos from a specific page.",
  hasPrefix: false,
  credits: "Ry",
  cooldowns: 15,
  category: "media",
  usages: "[page number]"
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const page = parseInt(args[0]) || 1;

  try {
    api.sendMessage(`📥 Fetching Pinay videos from page ${page}, please wait...`, threadID, messageID);

    const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/pinayot?page=${page}`);
    const videos = res.data?.result;

    if (!videos || videos.length === 0) {
      return api.sendMessage("❌ No videos found on that page. Try another one.", threadID, messageID);
    }

    for (const video of videos) {
      if (!video.videoUrl) continue;

      const fileName = `${Date.now()}_pinayot.mp4`;
      const filePath = path.join(__dirname, fileName);

      const videoStream = await axios({
        method: 'GET',
        url: video.videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await api.sendMessage({
        body: `🎥 ${video.description}\n📅 Uploaded: ${video.uploadDate}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));
    }

  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    api.sendMessage("🚫 An error occurred while fetching videos.", threadID, messageID);
  }
};