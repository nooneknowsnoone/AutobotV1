const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "animecdp",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Get couple DP images",
  hasPrefix: false,
  aliases: ["getcdp", "cdp"],
  usage: "[cdp]",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const apiUrl = "https://ace-rest-api.onrender.com/api/cdp";

  try {
    api.sendMessage("⌛ Fetching couple DP images, please wait...", event.threadID);

    const response = await axios.get(apiUrl);
    const { avatar, character, anime } = response.data;

    const imagePaths = [];

    for (let i = 0; i < avatar.length; i++) {
      const imgBuffer = await axios.get(avatar[i], { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `cdp_${i}.jpg`);
      fs.writeFileSync(filePath, imgBuffer.data);
      imagePaths.push(filePath);
    }

    const attachments = imagePaths.map(p => fs.createReadStream(p));
    const message = `🌸 Character: ${character}\n🎥 Anime: ${anime}`;

    api.sendMessage(
      { body: message, attachment: attachments },
      event.threadID,
      () => {
        imagePaths.forEach(p => fs.unlinkSync(p));
      }
    );
  } catch (err) {
    console.error("CDP Fetch Error:", err.message);
    api.sendMessage("❌ Failed to fetch Couple DP. Please try again later.", event.threadID);
  }
};