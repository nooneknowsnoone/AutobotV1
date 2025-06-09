module.exports.config = {
    name: "fuck",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a 'fuck' image using two Facebook user IDs",
    hasPrefix: false,
    aliases: ["fuck"],
    usage: "[fuck <uid1> | <uid2>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ").split("|").map(a => a.trim());
        const [uid1, uid2] = input;

        if (!uid1 || !uid2) {
            return api.sendMessage("❌ Usage: fuck <uid1> | <uid2>\nExample: fuck 100027399343135 | 100082748880815", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/fuck?one=${encodeURIComponent(uid1)}&two=${encodeURIComponent(uid2)}`;
        const imagePath = path.join(__dirname, `fuck_${Date.now()}.png`);

        api.sendMessage("🔞 Generating image, please wait...", event.threadID);

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
            } catch (err) {
                console.error('Send error:', err);
                api.sendMessage("❌ Error sending the image.", event.threadID);
            }
        });

        writer.on('error', err => {
            console.error('Write error:', err);
            api.sendMessage("❌ Error saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("Command Error:", error);
        api.sendMessage("❌ Failed to generate the image.", event.threadID);
    }
};