module.exports.config = {
    name: "hack",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a fake hack image with name and UID",
    hasPrefix: false,
    aliases: ["hack"],
    usage: "[hack <name> | <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ").split("|").map(i => i.trim());

        const name = input[0];
        const uid = input[1];

        if (!name || !uid) {
            return api.sendMessage("❌ Usage: hack <name> | <uid>\nExample: hack Mark Zuckerberg | 4", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/hack?name=${encodeURIComponent(name)}&uid=${encodeURIComponent(uid)}`;
        const imagePath = path.join(__dirname, `hack_${Date.now()}.png`);

        api.sendMessage("💻 Generating hack image, please wait...", event.threadID);

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
        console.error("Hack Command Error:", error);
        api.sendMessage("❌ Failed to generate hack image.", event.threadID);
    }
};