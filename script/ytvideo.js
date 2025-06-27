const axios = require("axios");
const fs = require("fs");
const path = require("path");

const SEARCH_URL = "https://kaiz-apis.gleeze.com/api/ytsearch";
const DOWNLOAD_URL = "https://kaiz-apis.gleeze.com/api/ytdl";
const SEARCH_API_KEY = "0c1e7e33-d809-48a6-9e92-d6691a722633";
const DOWNLOAD_API_KEY = "86397083-298d-4b97-a76e-414c1208beae";

module.exports.config = {
  name: "ytvideo",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search and download YouTube video.",
  usage: "ytvideo [video name]",
  credits: "developer",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a search query.\n\nUsage: ytvideo [video name]", threadID, messageID);
  }

  const query = args.join(" ");
  await api.sendMessage("🔍 Searching YouTube video, please wait...", threadID, messageID);

  try {
    // Step 1: Search video
    const searchRes = await axios.get(SEARCH_URL, {
      params: {
        q: query,
        apikey: SEARCH_API_KEY
      }
    });

    const video = searchRes.data?.items?.[0];
    if (!video) {
      return api.sendMessage("⚠️ No video found.", threadID, messageID);
    }

    const { title, url, thumbnail } = video;

    // Step 2: Get download info
    const downloadRes = await axios.get(DOWNLOAD_URL, {
      params: {
        url,
        apikey: DOWNLOAD_API_KEY
      }
    });

    const result = downloadRes.data;
    if (!result.download_url) {
      return api.sendMessage("⚠️ No downloadable video found.", threadID, messageID);
    }

    const thumbPath = path.join(__dirname, "cache", `thumb_${senderID}.jpg`);
    const videoPath = path.join(__dirname, "cache", `video_${senderID}.mp4`);

    // Step 3: Download thumbnail
    const thumbRes = await axios.get(result.thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(thumbPath, thumbRes.data);

    // Step 4: Download video
    const videoRes = await axios.get(result.download_url, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, videoRes.data);

    // Step 5: Send thumbnail and info
    api.sendMessage({
      body: `🎬 ${result.title}\n👤 By: ${result.author}\n🕒 Duration: ${result.duration || "N/A"}`,
      attachment: fs.createReadStream(thumbPath)
    }, threadID, () => {
      // Step 6: Send video
      api.sendMessage({
        body: "📽️ Here’s your YouTube video:",
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => {
        fs.unlinkSync(thumbPath);
        fs.unlinkSync(videoPath);
      });
    });

  } catch (error) {
    console.error("ytvideo command error:", error);
    return api.sendMessage("❌ Error: Unable to fetch or send the video.", threadID, messageID);
  }
};