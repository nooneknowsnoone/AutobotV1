const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ytvideo",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search and download YouTube video.",
  usage: "ytvideo [video name]",
  credits: "developer",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a video name.\n\nUsage: ytvideo [video name]", threadID, messageID);
  }

  const SEARCH_API_KEY = "0c1e7e33-d809-48a6-9e92-d6691a722633";
  const DOWNLOAD_API_KEY = "86397083-298d-4b97-a76e-414c1208beae";

  const keyword = encodeURIComponent(args.join(" "));
  const searchURL = `https://kaiz-apis.gleeze.com/api/ytsearch?q=${keyword}&apikey=${SEARCH_API_KEY}`;

  await api.sendMessage("🔎 Searching YouTube, please wait...", threadID, messageID);

  try {
    const searchRes = await axios.get(searchURL);
    const video = searchRes.data?.items?.[0];

    if (!video || !video.url) {
      return api.sendMessage("❌ No YouTube video found.", threadID, messageID);
    }

    const downloadURL = `https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(video.url)}&apikey=${DOWNLOAD_API_KEY}`;
    const dlRes = await axios.get(downloadURL);
    const { title, download_url, author, duration, thumbnail } = dlRes.data;

    if (!download_url) {
      return api.sendMessage("⚠️ Unable to get a downloadable link.", threadID, messageID);
    }

    const thumbPath = path.join(__dirname, "cache", `thumb_${senderID}.jpg`);
    const videoPath = path.join(__dirname, "cache", `video_${senderID}.mp4`);

    const thumbRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(thumbPath, thumbRes.data);

    const videoRes = await axios.get(download_url, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, videoRes.data);

    api.sendMessage({
      body: `🎬 Title: ${title}\n👤 Author: ${author}\n⏱ Duration: ${duration || "N/A"}`,
      attachment: fs.createReadStream(thumbPath)
    }, threadID, () => {
      api.sendMessage({
        body: "📽️ Here's your YouTube video!",
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => {
        fs.unlinkSync(thumbPath);
        fs.unlinkSync(videoPath);
      });
    });

  } catch (error) {
    console.error("YouTube command error:", error);
    return api.sendMessage("❌ An error occurred while processing the video.", threadID, messageID);
  }
};