const axios = require('axios');

module.exports.config = {
  name: "screenshot",
  version: "1.0.0",
  credits: "developer",
  description: "Takes a screenshot of the provided website URL using Kaiz API.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["sitecap", "ss"],
};

module.exports.run = async function ({ api, event, args }) {
  const url = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!url) {
    return api.sendMessage(
      "✦ Please provide a website URL to take a screenshot.\n\nExample:\n\nscreenshot https://www.facebook.com",
      threadID,
      messageID
    );
  }

  const encodedUrl = encodeURIComponent(url);
  const apiKey = "bbcc44b9-4710-41c7-8034-fa2000ea7ae5";
  const screenshotUrl = `https://kaiz-apis.gleeze.com/api/screenshot?url=${encodedUrl}&apikey=${apiKey}`;

  api.sendMessage("📸 Taking screenshot, please wait...", threadID, async () => {
    try {
      return api.sendMessage({
        body: `🖼️ Screenshot of: ${url}`,
        attachment: await axios.get(screenshotUrl, { responseType: "stream" }).then(res => res.data),
      }, threadID);
    } catch (error) {
      console.error("Screenshot error:", error);
      return api.sendMessage("❌ Failed to take screenshot. Please try again later.", threadID, messageID);
    }
  });
};