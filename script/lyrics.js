const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "lyrics",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Get song lyrics by title using Shazam.",
  usage: "lyrics [song title]",
  credits: " Ry",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!args[0]) {
    return api.sendMessage(
      "❌ Please provide a song title.\n\nUsage: lyrics [song title]",
      threadID,
      messageID
    );
  }

  const query = encodeURIComponent(args.join(" "));
  const url = `https://kaiz-apis.gleeze.com/api/shazam-lyrics?title=${query}&apikey=8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10`;
  const imgPath = path.join(__dirname, "cache", `lyrics_thumb_${senderID}.jpg`);

  try {
    const res = await axios.get(url);
    const data = res.data;

    if (!data || !data.lyrics) {
      return api.sendMessage("❌ No lyrics found for that song.", threadID, messageID);
    }

    // Send lyrics first
    await api.sendMessage(
      `🎵 *${data.title}*\n\n📝 Lyrics:\n${data.lyrics}`,
      threadID
    );

    // Download and send thumbnail image
    const imgRes = await axios.get(data.thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, imgRes.data);

    api.sendMessage(
      {
        body: `🎤 ${data.title} — Callalily\n\n📖 ${data.description}`,
        attachment: fs.createReadStream(imgPath),
      },
      threadID,
      () => fs.unlinkSync(imgPath)
    );
  } catch (err) {
    console.error("Lyrics command error:", err);
    return api.sendMessage(
      "❌ An error occurred while fetching the lyrics.",
      threadID,
      messageID
    );
  }
};