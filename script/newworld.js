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
    try {
        const input = args.join(" ");
        
        // Validate input format
        if (!input.includes("|")) {
            return api.sendMessage("🌍 Usage: newworld <uid> | <text>\nExample: newworld 1000123456789 | Hello world", event.threadID);
        }

        // Parse UID and text
        const [uid, ...textParts] = input.split("|").map(part => part.trim());
        const text = textParts.join(" ");

        // Validate UID and text
        if (!uid || !text || isNaN(uid)) {
            return api.sendMessage("🌍 Invalid input. Make sure the UID is numeric and text is provided.\nUsage: newworld <uid> | <text>", event.threadID);
        }

        // Construct API URL
        const url = `https://betadash-api-swordslush-production.up.railway.app/new-world?userid=${uid}&text=${encodeURIComponent(text)}`;
        const imagePath = path.join(__dirname, `newworld_${Date.now()}.png`);

        // Notify user
        api.sendMessage("⏳ Generating New World image, please wait...", event.threadID);

        // Fetch image from API
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error("Error sending image:", sendError);
                api.sendMessage("❌ An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on("error", err => {
            console.error("Stream writer error:", err);
            api.sendMessage("❌ An error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("NewWorld Command Error:", error.message);
        api.sendMessage("❌ Failed to generate New World image.", event.threadID);
    }
};