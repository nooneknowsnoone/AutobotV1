const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "brat",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Generate a Bratz-style image",
    hasPrefix: false,
    aliases: ["bratz"],
    usage: "[brat <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");
        if (!text) {
            return api.sendMessage("❌ Please provide text. Usage: brat <text>", event.threadID);
        }

        const encodedText = encodeURIComponent(text);
        const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${encodedText}`;
        const imagePath = path.join(__dirname, "brat.png");

        api.sendMessage("✨ Generating Bratz-style image, please wait...", event.threadID);

        const response = await axios({
            url: apiUrl,
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
                api.sendMessage("❌ Failed to send the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("❌ Failed to process the image.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("❌ An error occurred while generating the image.", event.threadID);
    }
};