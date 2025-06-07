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

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0];

        // Validate UID
        if (!uid || isNaN(uid)) {
            api.sendMessage("🏟️ Usage: stadium <uid>\nExample: stadium 1000123456789", event.threadID);
            return;
        }

        // API endpoint and image path
        const url = `https://betadash-api-swordslush-production.up.railway.app/stadium?userid=${uid}`;
        const imagePath = path.join(__dirname, "stadium.png");

        // Notify user
        api.sendMessage("⏳ Generating stadium image, please wait...", event.threadID);

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
        console.error("Stadium Command Error:", error.message);
        api.sendMessage("❌ Failed to generate stadium image.", event.threadID);
    }
};