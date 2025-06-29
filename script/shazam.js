const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "shazam",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search songs using Shazam and play preview.",
  usage: "shazam [song name]",
  credits: "Ry",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a song title.\n\nUsage: shazam [song name]", threadID, messageID);
  }

  const query = encodeURIComponent(args.join(" "));
  const searchURL = `https://betadash-api-swordslush-production.up.railway.app/shazam?title=${query}&limit=1`;

  await api.sendMessage("🔍 Searching Shazam... Please wait.", threadID, messageID);

  try {
    const res = await axios.get(searchURL);
    const track = res.data?.results?.[0];

    if (!track) {
      return api.sendMessage("❌ No track found on Shazam.", threadID, messageID);
    }

    const {
      title,
      artistName,
      albumName,
      thumbnail,
      durationInMillis,
      releaseDate,
      appleMusicUrl,
      previewUrl
    } = track;

    const durationSec = Math.floor(durationInMillis / 1000);
    const durationMin = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;

    const imgPath = path.join(__dirname, "cache", `shazam_thumb_${senderID}.jpg`);
    const audioPath = path.join(__dirname, "cache", `shazam_audio_${senderID}.mp3`);

    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, imgRes.data);

    api.sendMessage({
      body: `🎵 Title: ${title}\n👤 Artist: ${artistName}\n💽 Album: ${albumName}\n🕒 Duration: ${durationMin}\n📅 Release: ${releaseDate}\n🔗 URL: ${appleMusicUrl || 'N/A'}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, async () => {
      fs.unlinkSync(imgPath);

      if (previewUrl) {
        const audioRes = await axios.get(previewUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, audioRes.data);

        api.sendMessage({
          body: "🎧 Here's a preview of the track:",
          attachment: fs.createReadStream(audioPath)
        }, threadID, () => {
          fs.unlinkSync(audioPath);
        });
      } else {
        api.sendMessage("❌ No preview available for this track.", threadID);
      }
    });

  } catch (error) {
    console.error("Shazam error:", error);
    return api.sendMessage("❌ An error occurred while fetching Shazam data.", threadID, messageID);
  }
};