module.exports.config = {
    name: "jesus",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Jesus meme image with custom text",
    hasPrefix: true,
    aliases: ["jesus"],
    usage: "[jesus <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ").trim();

        // Validate input
        if (!text) {
            api.sendMessage("❌ Usage: jesus <text>\nExample: jesus cat", event.threadID);
            return;
        }

        // API endpoint and image path
        const url = `https://api-canvass.vercel.app/jesus?text=${encodeURIComponent(text)}`;
        const imagePath = path.join(__dirname, "jesus.png");

        // Notify user
        api.sendMessage("✝️ Generating Jesus image, please wait...", event.threadID);

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
        console.error("Jesus Command Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", event.threadID);
    }
};