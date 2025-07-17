const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fbcard",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Generate a Facebook card using custom data",
  hasPrefix: true,
  aliases: ["fbcard"],
  usage: "fbcard <id>|<name>",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) {
      return api.sendMessage(
        "❗ Please provide the ID and Name.\n\nExample:\nfbcard 4|Ry",
        event.threadID
      );
    }

    const [id, name] = args.join(" ").split("|").map(e => e.trim());

    if (!id || !name) {
      return api.sendMessage(
        "❌ Invalid format. Use: fbcard <id>|<name>\n\nExample:\nfbcard 4|Ry",
        event.threadID
      );
    }

    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/stalkfb?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
    const imagePath = path.join(__dirname, "fbcard.png");

    api.sendMessage("🖼️ Generating Facebook card, please wait...", event.threadID);

    const response = await axios({
      method: "GET",
      url: apiUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: "✅ Here's your Facebook card!",
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        () => fs.unlinkSync(imagePath)
      );
    });

    writer.on("error", (err) => {
      console.error("Stream error:", err);
      api.sendMessage("❌ Failed to generate the image. Please try again later.", event.threadID);
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    api.sendMessage("❌ An unexpected error occurred. Please try again later.", event.threadID);
  }
};