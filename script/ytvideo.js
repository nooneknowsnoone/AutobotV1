const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ytvideo",
  aliases: ["video"],
  version: "1.0.1",
  role: 0,
  description: "Search and download YouTube videos.",
  credits: "Ry",
  cooldown: 10,
};

module.exports.run = async function({ api, event, args }) {
  const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
  const DOWNLOAD_URL = 'https://kaiz-apis.gleeze.com/api/ytdl';
  const SEARCH_API_KEY = '0c1e7e33-d809-48a6-9e92-d6691a722633';
  const DOWNLOAD_API_KEY = '86397083-298d-4b97-a76e-414c1208beae';

  try {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("❌ Please provide a search query.", event.threadID, null, event.messageID);
    }

    api.sendMessage("🔎 Searching for the video...", event.threadID, null, event.messageID);

    // Step 1: Search YouTube video
    const searchRes = await axios.get(SEARCH_URL, {
      params: { q: query, apikey: SEARCH_API_KEY }
    });

    const video = searchRes.data?.items?.[0];
    if (!video) {
      return api.sendMessage("⚠️ No video found for that query.", event.threadID);
    }

    const { title, url } = video;

    // Step 2: Fetch download link
    const downloadRes = await axios.get(DOWNLOAD_URL, {
      params: { url, apikey: DOWNLOAD_API_KEY }
    });

    const result = downloadRes.data;
    if (!result.download_url) {
      return api.sendMessage("⚠️ Could not retrieve a downloadable video.", event.threadID);
    }

    const caption = `🎬 Title: ${result.title}\n👤 Author: ${result.author}\n⏱️ Duration: ${result.duration || 'N/A'}`;

    const filePath = path.join(__dirname, `/cache/ytvideo.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoStream = await axios({
      method: 'get',
      url: result.download_url,
      responseType: 'stream'
    });

    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        { body: caption, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    });

    writer.on("error", () => {
      api.sendMessage("❌ Error downloading the video.", event.threadID);
    });

  } catch (err) {
    console.error("Error:", err.message);
    api.sendMessage("❌ An error occurred while processing the request.", event.threadID);
  }
};