const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "freepik",
  version: "1.0.0",
  role: 0,
  credits: "Kayden",
  description: "Search and stream images from Freepik (no limit required)",
  hasPrefix: true,
  aliases: ["fpik"],
  usage: "freepik <keyword>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const keyword = args.join(" ").trim();
    if (!keyword)
      return api.sendMessage(
        "❌ Please enter a keyword to search.\nExample: freepik hello kitty",
        event.threadID,
        event.messageID
      );

    api.sendMessage(`🔍 Searching Freepik for "${keyword}"...`, event.threadID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/freepik?search=${encodeURIComponent(
      keyword
    )}&apikey=86397083-298d-4b97-a76e-414c1208beae`;

    const response = await axios.get(apiUrl);
    const images = response.data?.images;

    if (!images || images.length === 0)
      return api.sendMessage(
        `❌ No results found for "${keyword}".`,
        event.threadID
      );

    const maxSend = Math.min(images.length, 15); // Limit to first 15 images to avoid spam
    const imagePaths = [];

    for (let i = 0; i < maxSend; i++) {
      const imgUrl = images[i];
      const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, `fp_${i}.jpg`);
      fs.writeFileSync(imgPath, res.data);
      imagePaths.push(imgPath);
    }

    const attachments = imagePaths.map((file) =>
      fs.createReadStream(file)
    );

    api.sendMessage(
      {
        body: `✅ Found ${images.length} result(s) for "${keyword}". Showing first ${maxSend}:`,
        attachment: attachments,
      },
      event.threadID,
      () => {
        imagePaths.forEach((file) => fs.unlinkSync(file));
      }
    );
  } catch (error) {
    console.error("❌ Freepik command error:", error.message || error);
    api.sendMessage(
      "❌ An error occurred while fetching or sending the images.",
      event.threadID
    );
  }
};