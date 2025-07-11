module.exports.config = {
    name: "deepfry",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a deepfry meme from a user ID",
    hasPrefix: true,
    aliases: ["deepfry"],
    usage: "[deepfry <userid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    const { threadID } = event;

    const userId = args[0]?.trim();
    if (!userId) {
        return api.sendMessage("❌ Usage: deepfry <userid>\nExample: deepfry 6", threadID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/deepfry?userid=${userId}`;
    const imagePath = path.join(__dirname, `deepfry_${Date.now()}.png`);

    try {
        api.sendMessage("🍟 Deep frying the image, please wait...", threadID);

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
            api.sendMessage("❌ Error occurred while saving the image.", threadID);
        });

    } catch (error) {
        console.error("Deepfry Error:", error.message);
        api.sendMessage("❌ Failed to generate deepfry image.", threadID);
    }
};