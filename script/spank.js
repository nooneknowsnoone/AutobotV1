module.exports.config = {
    name: "spank",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a spank image between two user IDs",
    hasPrefix: false,
    aliases: ["spank"],
    usage: "[spank <uid1> | <uid2>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ");
        const [uid1, uid2] = input.split("|").map(e => e.trim());

        if (!uid1 || !uid2) {
            return api.sendMessage("❌ Usage: spank <uid1> | <uid2>\nExample: spank 4 | 6", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/spank?uid1=${uid1}&uid2=${uid2}`;
        const imagePath = path.join(__dirname, "spank.png");

        api.sendMessage("🍑 Generating spank image, please wait...", event.threadID);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID);
            fs.unlinkSync(imagePath);
        });

        writer.on('error', err => {
            console.error("Stream error:", err);
            api.sendMessage("❌ Error downloading the image.", event.threadID);
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
    }
};