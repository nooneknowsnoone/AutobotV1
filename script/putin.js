const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "putin",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Putin-themed image using Facebook UID",
    hasPrefix: false,
    aliases: ["putin"],
    usage: "[putin <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("🇷🇺 Usage: putin <uid>\nExample: putin 1000123456789", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/putin?userid=${uid}`;
    const imagePath = path.join(__dirname, `putin_${Date.now()}.png`);

    try {
        api.sendMessage("⏳ Generating Putin image, please wait...", threadID);

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
        console.error("Putin Command Error:", error.message);
        api.sendMessage("❌ Failed to generate Putin image.", threadID);
    }
};