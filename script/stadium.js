const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "stadium",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a stadium-themed image using Facebook UID",
    hasPrefix: false,
    aliases: ["stadium"],
    usage: "[stadium <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("🏟️ Usage: stadium <uid>\nExample: stadium 1000123456789", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/stadium?userid=${uid}`;
    const imagePath = path.join(__dirname, `stadium_${Date.now()}.png`);

    try {
        api.sendMessage("⏳ Generating stadium image, please wait...", threadID);

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
        console.error("Stadium Command Error:", error.message);
        api.sendMessage("❌ Failed to generate stadium image.", threadID);
    }
};