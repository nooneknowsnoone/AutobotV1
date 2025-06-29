const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "carbon",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a carbon code image.",
    hasPrefix: false,
    aliases: ["codeimg", "carbon"],
    usage: "[carbon <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");
        if (!text) {
            return api.sendMessage("Usage: carbon <text>", event.threadID);
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api.ferdev.my.id/maker/carbon?text=${encodedText}`;
        const imagePath = path.join(__dirname, "carbon.png");

        api.sendMessage("Generating your carbon image, please wait...", event.threadID);

        const response = await axios({
            url: url,
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
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error("Stream writer error:", err);
            api.sendMessage("An error occurred while processing the image.", event.threadID);
        });
    } catch (error) {
        console.error("API request error:", error);
        api.sendMessage("An error occurred while generating the image.", event.threadID);
    }
};