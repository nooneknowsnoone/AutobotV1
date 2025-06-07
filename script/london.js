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

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0];

        // Validate UID input
        if (!uid || isNaN(uid)) {
            api.sendMessage("Usage: london <uid>\nExample: london 1000123456789", event.threadID);
            return;
        }

        // Construct API request URL
        const url = `https://api-canvass.vercel.app/london-gallery?userid=${uid}`;
        const imagePath = path.join(__dirname, "london.png");

        // Inform the user
        api.sendMessage("Generating London gallery image, please wait...", event.threadID);

        // Request the image stream
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        // Write the image to disk
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // Send image once writing is done
        writer.on("finish", async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath); // Clean up after sending
            } catch (sendErr) {
                console.error("Error sending image:", sendErr);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle write stream errors
        writer.on("error", (err) => {
            console.error("Write stream error:", err);
            api.sendMessage("An error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("London Command Error:", error.message);
        api.sendMessage("Failed to generate the image.", event.threadID);
    }
};