module.exports.config = {
    name: "kiss",
    version: "1.0.0",
    role: 0,
    credits: "Rized", // Credit preserved
    description: "Generate a kiss image between two user IDs",
    hasPrefix: false,
    aliases: ["kiss"],
    usage: "[kiss <userid1> | <userid2>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ");
        const [userid1, userid2] = input.split("|").map(e => e.trim());

        if (!userid1 || !userid2) {
            return api.sendMessage("❌ Usage: kiss <userid1> | <userid2>\nExample: kiss 1 | 2", event.threadID);
        }

        const url = `https://betadash-api-swordslush-production.up.railway.app/kiss?userid1=${userid1}&userid2=${userid2}`;
        const imagePath = path.join(__dirname, "kiss.png");

        api.sendMessage("💋 Generating your kiss image, please wait...", event.threadID);

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
                console.error("Error sending image:", sendError);
                api.sendMessage("❌ Failed to send the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error("Stream error:", err);
            api.sendMessage("❌ Error occurred while downloading the image.", event.threadID);
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
    }
};