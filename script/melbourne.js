const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "melbourne",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Melbourne-themed image using Facebook UID",
    hasPrefix: false,
    aliases: ["melbourne"],
    usage: "[melbourne <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("🏙️ Usage: melbourne <uid>\nExample: melbourne 1000123456789", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/melbourne?userid=${uid}`;
    const imagePath = path.join(__dirname, `melbourne_${Date.now()}.png`);

    try {
        api.sendMessage("⏳ Generating Melbourne image, please wait...", threadID);

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            await api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID);
            fs.unlinkSync(imagePath);
        });

        writer.on("error", err => {
            console.error("Write stream error:", err);
            api.sendMessage("❌ Error saving the image.", threadID);
        });

    } catch (error) {
        console.error("Melbourne Command Error:", error.message);
        api.sendMessage("❌ Failed to generate Melbourne image.", threadID);
    }
};