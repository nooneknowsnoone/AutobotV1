module.exports.config = {
    name: "carbon",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate carbon-style code image",
    hasPrefix: true,
    aliases: ["carboncode", "carbon"],
    usage: "[carbon <code>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");

        if (!text) {
            return api.sendMessage("📝 Usage: carbon <code>", event.threadID);
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api.ferdev.my.id/maker/carbon?text=${encodedText}&apikey=lain-lain`;
        const imagePath = path.join(__dirname, "carbon.png");

        api.sendMessage("🖼️ Generating code image, please wait...", event.threadID);

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
            } catch (sendErr) {
                console.error('Send Error:', sendErr);
                api.sendMessage("❌ Error sending the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream Error:', err);
            api.sendMessage("❌ Error writing the image file.", event.threadID);
        });
    } catch (err) {
        console.error('Unexpected Error:', err);
        api.sendMessage("❌ An error occurred while generating the image.", event.threadID);
    }
};