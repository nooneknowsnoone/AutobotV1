module.exports.config = {
    name: "xmascap",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Christmas cap image using Facebook UID",
    hasPrefix: false,
    aliases: ["xmascap", "santahat"],
    usage: "[xmascap <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0];

        // Validate UID
        if (!uid || isNaN(uid)) {
            api.sendMessage("🎅 Usage: xmascap <uid>\nExample: xmascap 1000123456789", event.threadID);
            return;
        }

        // API endpoint and image path
        const url = `https://betadash-api-swordslush-production.up.railway.app/xmas-cap?userid=${uid}`;
        const imagePath = path.join(__dirname, "xmascap.png");

        // Notify user
        api.sendMessage("🎄 Generating image, please wait...", event.threadID);

        // Fetch the image from the API
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // Handle completion of the image download
        writer.on("finish", async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath); // Clean up
            } catch (sendErr) {
                console.error("Error sending image:", sendErr);
                api.sendMessage("❌ An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle file writing error
        writer.on("error", (err) => {
            console.error("Write stream error:", err);
            api.sendMessage("❌ Error saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("XmasCap Command Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", event.threadID);
    }
};