const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "hitler",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Hitler-themed meme image using a user ID",
    hasPrefix: false,
    aliases: ["hitler"],
    usage: "[hitler <userid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const userId = args[0]?.trim();
    if (!userId) {
        return api.sendMessage("❌ Usage: hitler <userid>\nExample: hitler 4", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/hitler?userid=${userId}`;
    const imagePath = path.join(__dirname, `hitler_${Date.now()}.png`);

    try {
        api.sendMessage("🕵️ Generating your Hitler image, please wait...", threadID);

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
        console.error("Hitler Command Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", threadID);
    }
};