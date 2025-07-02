const axios = require('axios');

module.exports.config = {
  name: "animcdp",
  version: "1.0.0",
  credits: "Ry",
  description: "Get a random character display picture (CDP) with anime info.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["charpic", "cdphoto"]
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const apiUrl = 'https://ace-rest-api.onrender.com/api/cdp';

  try {
    api.sendMessage("📥 Fetching character display picture...", threadID, async () => {
      try {
        const { data } = await axios.get(apiUrl);

        if (!data || !data.avatar || !data.character || !data.anime) {
          return api.sendMessage("❌ Failed to fetch CDP data.", threadID, messageID);
        }

        const text = `👥 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿: ${data.character}\n🎞️ 𝗔𝗻𝗶𝗺𝗲: ${data.anime}`;
        await api.sendMessage(text, threadID);

        // Send each image one by one
        for (const url of data.avatar) {
          const img = await axios.get(url, { responseType: 'stream' });
          await api.sendMessage({ attachment: img.data }, threadID);
        }

      } catch (err) {
        console.error("cdp command error:", err);
        api.sendMessage("❌ Error occurred while processing the CDP request.", threadID, messageID);
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    api.sendMessage("❌ Unable to connect to the CDP API.", threadID, messageID);
  }
};