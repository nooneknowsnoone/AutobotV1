const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "xmascap",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  aliases: ["xcap"],
  usages: "[blue|red] < reply to an image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, "cache", `xmascap_${Date.now()}.jpg`);

  // Validate reply to image
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("🎅 Please reply to an image to add a Christmas cap.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("📸 The replied message must be a photo.", threadID, messageID);
  }

  // Validate cap color
  let color = args[0]?.toLowerCase();
  if (color !== "blue" && color !== "red") {
    color = "red"; // default
  }

  const imageUrl = attachment.url;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/xmas-cap?imageUrl=${encodeURIComponent(imageUrl)}&color=${color}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    api.sendMessage(`🎄 Adding ${color} Christmas cap... Please wait!`, threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: `✅ Here is your image with a ${color} Christmas cap! 🎅`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Xmas Cap Error:", error.message);
    api.sendMessage("❌ An error occurred while processing the image. Please try again later.", threadID, messageID);
  }
};