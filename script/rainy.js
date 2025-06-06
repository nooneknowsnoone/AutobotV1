module.exports.config = {
    name: "rainy",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a rainy night image using a user ID",
    hasPrefix: false,
    aliases: ["rainynight", "rainy"],
    usage: "[rainy <userid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    const { threadID } = event;

    const userId = args[0]?.trim();
    if (!userId) {
        return api.sendMessage("❌ Usage: rainy <userid>\nExample: rainy <uid>", threadID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/rainy-night?userid=${userId}`;
    const imagePath = path.join(__dirname, `rainy_${Date.now()}.png`);

    try {
        api.sendMessage("🌧️ Creating a rainy night scene, please wait...", threadID);

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
        console.error("Rainy Error:", error.message);
        api.sendMessage("❌ Failed to generate rainy night image.", threadID);
    }
};