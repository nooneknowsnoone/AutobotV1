const axios = require('axios');

module.exports.config = {
  name: "anime",
  version: "1.0.0",
  credits: "Original Developer",
  description: "Get a random anime character with image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["animechar", "animeface"]
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const apiUrl = 'https://mademoiselle2-rest-apis.onrender.com/api/anime-random';

  try {
    api.sendMessage("🎌 Fetching a random anime character...", threadID, async () => {
      try {
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.random) {
          return api.sendMessage("❌ Failed to fetch anime data.", threadID, messageID);
        }

        const anime = data.random;
        const text = `🎌 𝗡𝗮𝗺𝗲: ${anime.name}\n🎥 𝗔𝗻𝗶𝗺𝗲: ${anime.movie}`;

        // Send text first
        await api.sendMessage(text, threadID);

        // Then send the image
        const image = await axios.get(anime.imgAnime, { responseType: 'stream' });
        await api.sendMessage({
          attachment: image.data
        }, threadID);
      } catch (err) {
        console.error("anime command error:", err);
        api.sendMessage("❌ Error occurred while processing the request.", threadID, messageID);
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    api.sendMessage("❌ Unable to connect to the Anime API.", threadID, messageID);
  }
};