const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "fpv",
  version: "1.0.0",
  credits: "Rized",
  description: "Generate image using FluxVision AI based on a prompt",
  hasPrefix: true,
  cooldown: 5,
  aliases: [],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠️ Please provide a prompt to generate the image.", event.threadID, event.messageID);
    }

    api.sendMessage("⚡ Generating image using FluxVision AI...", event.threadID, async () => {
      try {
        const apiUrl = `https://rapido.zetsu.xyz/api/flux?prompt=${encodeURIComponent(prompt)}`;
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const fileName = `flux_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, 'cache', fileName);
        await fs.outputFile(filePath, res.data);

        return api.sendMessage({
          body: `🖼️ FluxVision Output for: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (err) {
        console.error("FluxVision Error:", err);
        api.sendMessage("❌ Failed to generate image with FluxVision.", event.threadID);
      }
    });
  } catch (err) {
    console.error("Command Execution Error:", err);
    api.sendMessage(err.message, event.threadID);
  }
};