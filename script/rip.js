module.exports.config = {
    name: "rip",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a RIP gravestone image using Facebook UID",
    hasPrefix: false,
    aliases: ["rip"],
    usage: "[rip <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const uid = args[0]?.trim();
        if (!uid) {
            return api.sendMessage("❌ Usage: rip <uid>\nExample: rip 4", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/rip?userid=${encodeURIComponent(uid)}`;
        const imagePath = path.join(__dirname, `rip_${Date.now()}.png`);

        api.sendMessage("💀 Generating RIP image, please wait...", event.threadID);

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
                api.sendMessage("❌ Error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', err => {
            console.error('Stream writer error:', err);
            api.sendMessage("❌ Error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("RIP Command Error:", error);
        api.sendMessage("❌ Failed to generate RIP image.", event.threadID);
    }
};