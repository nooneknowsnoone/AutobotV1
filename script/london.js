const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "london",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate London gallery image from Facebook UID",
    hasPrefix: false,
    aliases: ["london"],
    usage: "[london <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("❌ Usage: london <uid>\nExample: london 1000123456789", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/london-gallery?userid=${uid}`;
    const imagePath = path.join(__dirname, `london_${Date.now()}.png`);

    try {
        api.sendMessage("🖼️ Generating London gallery image, please wait...", threadID);

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
            console.error("Stream write error:", err);
            api.sendMessage("❌ Error saving the image.", threadID);
        });

    } catch (error) {
        console.error("London Command Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", threadID);
    }
};