module.exports.config = {
    name: "citybillboard",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a city billboard image using Facebook user ID",
    hasPrefix: false,
    aliases: ["citybillboard"],
    usage: "[citybillboard <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0]?.trim();

        if (!uid) {
            return api.sendMessage("❌ Usage: citybillboard <uid>\nExample: citybillboard 4", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/city-billboard?userid=${encodeURIComponent(uid)}`;
        const imagePath = path.join(__dirname, `citybillboard_${Date.now()}.png`);

        api.sendMessage("🖼️ Generating your city billboard image, please wait...", event.threadID);

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
                console.error('Send error:', sendError);
                api.sendMessage("❌ Error sending the image.", event.threadID);
            }
        });

        writer.on('error', err => {
            console.error('Write stream error:', err);
            api.sendMessage("❌ Error saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("City Billboard Command Error:", error);
        api.sendMessage("❌ Failed to generate the city billboard image.", event.threadID);
    }
};