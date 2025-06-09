module.exports.config = {
    name: "phub",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a PHub-style image with text, name, and Facebook UID",
    hasPrefix: false,
    aliases: ["phub"],
    usage: "[phub <text> | <name> | <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ").split("|").map(item => item.trim());
        const [text, name, uid] = input;

        if (!text || !name || !uid) {
            return api.sendMessage(
                "❌ Usage: phub <text> | <name> | <uid>\nExample: phub Blurd shit | Mark Zuckerberg | 4",
                event.threadID
            );
        }

        const url = `https://api-canvass.vercel.app/phub?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&id=${encodeURIComponent(uid)}`;
        const imagePath = path.join(__dirname, `phub_${Date.now()}.png`);

        api.sendMessage("📸 Generating PHub image, please wait...", event.threadID);

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
            console.error('Stream writer error:', err);
            api.sendMessage("❌ An error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("PHub Command Error:", error);
        api.sendMessage("❌ Failed to generate PHub image.", event.threadID);
    }
};