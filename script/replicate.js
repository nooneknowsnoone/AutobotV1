const axios = require('axios');

module.exports.config = {
  name: "replicate",
  version: "1.0.0",
  credits: "developer",
  description: "Generates an AI image using the FLUX Replicate model.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["flux"],
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "Please enter a prompt to generate a FLUX image.\n\nExample: replicate futuristic city",
      event.threadID,
      event.messageID
    );
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/flux-replicate?prompt=${encodeURIComponent(prompt)}&apikey=52c32711-e257-448e-b96d-06d86f77e6a4`;

  api.sendMessage("Generating your FLUX image, please wait...", event.threadID, async (err, info) => {
    try {
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (!response.data) {
        return api.sendMessage("Failed to generate the image.", event.threadID, event.messageID);
      }

      return api.sendMessage({
        body: `FLUX image generated.\nPrompt: ${prompt}`,
        attachment: response.data
      }, event.threadID);
    } catch (error) {
      console.error("FLUX generation error:", error);
      api.sendMessage("An error occurred while generating the image.", event.threadID);
    }
  });
};