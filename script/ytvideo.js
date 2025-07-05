const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
  name: "ytvideo",
  version: "1.0.0",
  role: 0,
  description: "Search and download a YouTube video based on a query.",
  prefix: false,
  credits: "Ry",
  cooldowns: 10,
  category: "media"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("❌ Please provide a YouTube search query.\n\nExample: ytvideo misteryoso fingerstyle", threadID, messageID);
  }

  const query = encodeURIComponent(args.join(" "));
  const searchUrl = `https://xvi-rest-api.vercel.app/api/ytsearch?query=${query}`;

  try {
    api.sendMessage("🔎 Searching YouTube, please wait...", threadID, messageID);

    const searchRes = await axios.get(searchUrl);
    const videoData = searchRes.data?.data?.[0];

    if (!videoData || !videoData.url) {
      return api.sendMessage("❌ No video found for that query.", threadID, messageID);
    }

    const downloadApi = `https://api.zetsu.xyz/download/youtube?url=${encodeURIComponent(videoData.url)}&apikey=6fbd0a144a296d257b30a752d4a178a5`;
    const downloadRes = await axios.get(downloadApi);
    const media = downloadRes.data?.result?.medias?.[0];

    if (!media?.url) {
      return api.sendMessage("❌ Failed to retrieve video download link.", threadID, messageID);
    }

    const fileName = `ytvideo_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, fileName);

    const stream = await axios({
      method: "GET",
      url: media.url,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    stream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🎬 ${videoData.title}\n📺 ${videoData.url}\n⏱ Duration: ${videoData.duration}\n👁 Views: ${videoData.views}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", () => {
      fs.unlinkSync(filePath);
      api.sendMessage("❌ Error writing video file.", threadID, messageID);
    });

  } catch (error) {
    console.error("ytvideo error:", error.message);
    return api.sendMessage("⚠️ Failed to process your YouTube request.", threadID, messageID);
  }
};