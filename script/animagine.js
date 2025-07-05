const axios = require('axios');

module.exports.config = {
  name: "animagine",
  version: "1.0.0",
  credits: "Ry",
  description: "Generates an anime-style image based on the provided prompt.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["animegen", "aimg"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "🎨 Please provide a prompt to generate an anime-style image.\n\nExample: animagine cute girl with flowers",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage("✨ Generating your Animagine image, please wait...", event.threadID, async () => {
      try {
        const apiUrl = `https://api.zetsu.xyz/api/animagine?prompt=${encodeURIComponent(prompt)}&apikey=6fbd0a144a296d257b30a752d4a178a5`;
        const response = await axios.get(apiUrl, { responseType: "stream" });

        if (!response.data) {
          return api.sendMessage("❌ Failed to retrieve the image.", event.threadID, event.messageID);
        }

        return api.sendMessage({
          body: "🖼️ Here is your anime-style image:",
          attachment: response.data,
        }, event.threadID);
      } catch (error) {
        console.error("Animagine Error:", error);
        api.sendMessage("❌ An error occurred while generating your image.", event.threadID);
      }
    });
  } catch (err) {
    api.sendMessage(err.message, event.threadID);
  }
};