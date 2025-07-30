const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  role: 0,
  description: "Fetch a random TikTok shoti video .",
  hasPrefix: false,
  credits: "Ry",
  cooldowns: 10,
  category: "media"
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  try {
    api.sendMessage("📥 Fetching TikTok video, please wait...", threadID, messageID);

    // Call API
    const res = await axios.get('https://hershey-apis.onrender.com/api/shoti');
    const videoUrl = res.data?.details?.videoUrl;

    if (!videoUrl) {
      return api.sendMessage("❌ No video found. Please try again later.", threadID, messageID);
    }

    const fileName = `${messageID}_tiktok.mp4`;
    const filePath = path.join(__dirname, fileName);

    // Download video
    const videoStream = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on('finish', async () => {
      api.sendMessage({
        body: '🎥 Here is your TikTok video!',
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath); // Cleanup
      }, messageID);
    });

    writer.on('error', () => {
      api.sendMessage("🚫 Error downloading the video. Please try again.", threadID, messageID);
    });

  } catch (error) {
    console.error("❌ Error fetching TikTok video:", error);
    api.sendMessage("🚫 Error fetching TikTok video. Try again later.", threadID, messageID);
  }
};