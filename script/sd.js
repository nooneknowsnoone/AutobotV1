const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "sd",
  version: "1.0.0",
  credits: "Rized",
  description: "Generates an image using Stable Diffusion based on the given prompt",
  hasPrefix: true,
  cooldown: 5,
  aliases: ["diffusion"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt for image generation.", event.threadID, event.messageID);
    }

    api.sendMessage("🧠 Generating image from prompt...", event.threadID, async () => {
      try {
        const apiUrl = `https://rapido.zetsu.xyz/api/sd?prompt=${encodeURIComponent(prompt)}`;
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const fileName = `sd_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, 'cache', fileName);
        await fs.outputFile(filePath, res.data);

        return api.sendMessage({
          body: `🖼️ Prompt: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (error) {
        console.error("Image generation error:", error);
        api.sendMessage("❌ Failed to generate image.", event.threadID);
      }
    });
  } catch (err) {
    console.error("Command error:", err);
    api.sendMessage(err.message, event.threadID);
  }
};