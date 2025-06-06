const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "newworld",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a New World-themed image using Facebook UID and text",
    hasPrefix: false,
    aliases: ["newworld"],
    usage: "[newworld <uid> | <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const input = args.join(" ");
    if (!input.includes("|")) {
        return api.sendMessage("🌍 Usage: newworld <uid> | <text>\nExample: newworld 1000123456789 | Hello world", threadID, messageID);
    }

    const [uid, ...textParts] = input.split("|").map(part => part.trim());
    const text = textParts.join(" ");

    if (!uid || !text || isNaN(uid)) {
        return api.sendMessage("🌍 Invalid input. Make sure the UID is numeric and text is provided.\nUsage: newworld <uid> | <text>", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/new-world?userid=${uid}&text=${encodeURIComponent(text)}`;
    const imagePath = path.join(__dirname, `newworld_${Date.now()}.png`);

    try {
        api.sendMessage("⏳ Generating New World image, please wait...", threadID);

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
        console.error("NewWorld Command Error:", error.message);
        api.sendMessage("❌ Failed to generate New World image.", threadID);
    }
};