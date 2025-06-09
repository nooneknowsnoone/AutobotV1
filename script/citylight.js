module.exports.config = {
    name: "citylight",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a city light-style image using a Facebook user ID",
    hasPrefix: false,
    aliases: ["citylight"],
    usage: "[citylight <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0]?.trim();

        if (!uid) {
            return api.sendMessage("❌ Usage: citylight <uid>\nExample: citylight 4", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/city-light?userid=${encodeURIComponent(uid)}`;
        const imagePath = path.join(__dirname, `citylight_${Date.now()}.png`);

        api.sendMessage("🌃 Generating your city light image, please wait...", event.threadID);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("❌ An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', err => {
            console.error('Stream write error:', err);
            api.sendMessage("❌ An error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("Citylight Command Error:", error);
        api.sendMessage("❌ Failed to generate city light image.", event.threadID);
    }
};