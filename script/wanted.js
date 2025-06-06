const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "wanted",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a wanted poster from a user's profile photo",
    hasPrefix: false,
    aliases: ["wanted"],
    usage: "[wanted <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("❌ Usage: wanted <uid>\nExample: wanted 1000123456789", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/wanted?userid=${uid}`;
    const imagePath = path.join(__dirname, `wanted_${Date.now()}.png`);

    try {
        api.sendMessage("🔍 Generating wanted poster, please wait...", threadID);

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
        console.error("Wanted Command Error:", error.message);
        api.sendMessage("❌ Failed to generate wanted poster.", threadID);
    }
};