const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/spotify-search';
const DOWNLOAD_URL = 'https://kaiz-apis.gleeze.com/api/spotify-down';
const API_KEY = '8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10';

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['spsearch', 'splay'],
  usage: 'spotify [song name]',
  description: 'Search and download Spotify track',
  credits: 'developer',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(' ');
  if (!query) {
    return api.sendMessage(`❗ Please provide the title of the Spotify track.`, event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching Spotify for "${query}"...`, event.threadID, event.messageID);

  try {
    // Search Spotify
    const searchRes = await axios.get(SEARCH_URL, {
      params: {
        q: query,
        apikey: API_KEY
      }
    });

    const track = searchRes.data?.[0];
    if (!track || !track.trackUrl) {
      return api.sendMessage(`❌ No track found.`, event.threadID, event.messageID);
    }

    // Download track
    const dlRes = await axios.get(DOWNLOAD_URL, {
      params: {
        url: track.trackUrl,
        apikey: API_KEY
      }
    });

    const { title, url, artist, thumbnail } = dlRes.data;

    // Send info as image template
    await api.sendMessage({
      attachment: await global.utils.getStreamFromURL(thumbnail),
      body: `🎵 Title: ${title}\n👤 Artist: ${artist}`
    }, event.threadID);

    // Download MP3 file
    const fileName = `${Date.now()}_spotify.mp3`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const audioStream = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });

    audioStream.data.pipe(writer);

    writer.on('finish', () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      api.sendMessage({
        body: `✅ Here's your Spotify track: ${title} by ${artist}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });

    writer.on('error', (err) => {
      console.error('File write error:', err);
      api.sendMessage(`❌ Failed to download the track.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('Spotify error:', err.message);
    api.sendMessage(`❌ An error occurred while processing your request.`, event.threadID, event.messageID);
  }
};