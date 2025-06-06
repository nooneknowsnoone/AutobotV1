module.exports.config = {
    name: "slap",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a slap image between two user IDs",
    hasPrefix: false,
    aliases: ["slap"],
    usage: "[slap <batman> | <superman>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ");
        const [batman, superman] = input.split("|").map(e => e.trim());

        if (!batman || !superman) {
            return api.sendMessage("❌ Usage: slap <batman> | <superman>\nExample: slap <uid1> | <uid2>", event.threadID);
        }

        const url = `https://betadash-api-swordslush-production.up.railway.app/slap?batman=${batman}&superman=${superman}`;
        const imagePath = path.join(__dirname, "slap.png");

        api.sendMessage("🖐️ Generating slap image, please wait...", event.threadID);

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
        api.sendMessage("❌ An error occurred while processing the request.", event.threadID);
    }
};