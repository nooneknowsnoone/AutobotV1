const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "trump",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate an image with Trump holding your custom sign",
    hasPrefix: false,
    aliases: ["trump"],
    usage: "[trump <uid> | <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const input = args.join(" ").split("|").map(x => x.trim());
    const [uid, text] = input;

    if (!uid || !text) {
        return api.sendMessage("❌ Usage: trump <uid> | <text>\nExample: trump 1000123456789 | my love still by you", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/trump?userid=${uid}&text=${encodeURIComponent(text)}`;
    const imagePath = path.join(__dirname, `trump_${Date.now()}.png`);

    try {
        api.sendMessage("🇺🇸 Generating Trump image, please wait...", threadID);

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
        console.error("Trump Command Error:", error.message);
        api.sendMessage("❌ Failed to generate Trump image.", threadID);
    }
};