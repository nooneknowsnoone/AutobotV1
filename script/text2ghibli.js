const axios = require("axios");

module.exports.config = {
  name: "text2ghibli",
  version: "1.0.0",
  credits: "developer",
  description: "Generates a Ghibli-style image from the given prompt.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["ghibli"]
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "Please provide a prompt to generate a Ghibli-style image.\n\nExample: text2ghibli dog",
      threadID,
      messageID
    );
  }

  const imageUrl = `https://api.ferdev.my.id/tools/text2ghibli?prompt=${encodeURIComponent(prompt)}`;

  api.sendMessage("Generating your Ghibli-style image...", threadID, async () => {
    try {
      const imageStream = await axios.get(imageUrl, { responseType: "stream" });

      if (!imageStream.data) {
        return api.sendMessage("Failed to retrieve the Ghibli image.", threadID, messageID);
      }

      return api.sendMessage({
        body: "Here is your Ghibli-style image:",
        attachment: imageStream.data
      }, threadID);
    } catch (error) {
      console.error("Error generating image:", error);
      return api.sendMessage("An error occurred while generating the image. Please try again later.", threadID, messageID);
    }
  });
};