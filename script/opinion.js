module.exports.config = {
    name: "opinion",
    version: "1.0.0",
    role: 0,
    credits: "Ry", // Credit as requested
    description: "Generate an opinion meme image with your custom text.",
    hasPrefix: false,
    aliases: ["opinion"],
    usage: "[opinion <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");

        if (!text) {
            api.sendMessage("❗ Usage: opinion <text>", event.threadID);
            return;
        }

        const encodedText = encodeURIComponent(text);
        const imageUrl = "https://i.kym-cdn.com/photos/images/newsfeed/001/394/351/33a.jpg";
        const apiUrl = `https://api.popcat.xyz/v2/opinion?image=${encodeURIComponent(imageUrl)}&text=${encodedText}`;
        const imagePath = path.join(__dirname, "opinion.png");

        api.sendMessage("💬 Generating your opinion meme, please wait...", event.threadID);

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
                api.sendMessage("❌ An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("❌ An error occurred while processing the image.", event.threadID);
        });

    } catch (error) {
        console.error('Request error:', error);
        api.sendMessage("❌ An error occurred while processing the request.", event.threadID);
    }
};