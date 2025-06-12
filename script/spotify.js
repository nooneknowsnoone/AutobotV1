const path = require('path');
module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["spot"],
  usage: "spotify <song name>",
  description: "Search and download Spotify track.",
  credits: "developer",
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const fs = require("fs-extra");
  const axios = require("axios");

  const songName = args.join(' ');
  if (!songName) {
    api.sendMessage(`❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝗶𝘁𝗹𝗲.`, event.threadID, event.messageID);
    return;
  }

  try {
    api.sendMessage(`🔍 Searching for "${songName}"...`, event.threadID, event.messageID);

    const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${encodeURIComponent(songName)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;
    const searchRes = await axios.get(searchURL);
    const track = searchRes.data[0];

    if (!track || !track.trackUrl) {
      return api.sendMessage("❌ No track found.", event.threadID, event.messageID);
    }

    const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}&apikey=8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10`;
    const dlRes = await axios.get(downloadURL, { responseType: 'stream' });
    const { headers } = dlRes;
    const contentType = headers['content-type'];
    const contentLength = parseInt(headers['content-length'], 10);
    const isAudio = contentType && contentType.startsWith('audio');

    if (!isAudio || !contentLength) {
      return api.sendMessage("❌ Failed to retrieve audio file.", event.threadID, event.messageID);
    }

    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(__dirname, 'cache', `${timestamp}_spotify.mp3`);

    const writer = fs.createWriteStream(filePath);
    dlRes.data.pipe(writer);

    writer.on("finish", () => {
      if (fs.statSync(filePath).size > 26214400) { // 25MB limit
        fs.unlinkSync(filePath);
        return api.sendMessage('❌ The file could not be sent because it is larger than 25MB.', event.threadID);
      }

      const message = {
        body: `🎵 ${dlRes.data.title || track.title || 'Spotify Track'}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on("error", (err) => {
      console.error("File Write Error:", err);
      api.sendMessage("❌ Error saving the audio file.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error("Spotify Error:", error);
    api.sendMessage('❌ An error occurred while processing your request.', event.threadID, event.messageID);
  }
};