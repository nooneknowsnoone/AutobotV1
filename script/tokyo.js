module.exports.config = {
    name: "tokyo",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Generate a Tokyo Crossing style image using a user ID",
    hasPrefix: false,
    aliases: ["tokyo"],
    usage: "[tokyo <userID>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function ({ api, event, args }) {
    try {
        // Ensure the user provided a User ID
        const userId = args[0];
        if (!userId) {
            return api.sendMessage(
                "✦ Please provide a User ID to generate a Tokyo Crossing poster.\n\nExample: tokyo 100038829182",
                event.threadID
            );
        }

        // Construct the API URL
        const url = `https://betadash-api-swordslush-production.up.railway.app/tokyo-crossing?userid=${encodeURIComponent(userId)}`;
        const imagePath = path.join(__dirname, "tokyo.png");

        // Notify user that generation has started
        api.sendMessage("🗼 Generating your Tokyo Crossing image, please wait...", event.threadID);

        // Fetch image
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Save image locally
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // On finish, send and clean up
        writer.on('finish', async () => {
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

        writer.on('error', (err) => {
            console.error("Stream writer error:", err);
            api.sendMessage("❌ An error occurred while processing the image.", event.threadID);
        });

    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❌ An error occurred while generating the image. Please try again later.", event.threadID);
    }
};