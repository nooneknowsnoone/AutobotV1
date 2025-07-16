const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "bratv2",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate bratv2 meme image",
    hasPrefix: true,
    aliases: ["bratv2"],
    usage: "[brat <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");
        if (!text) {
            return api.sendMessage("📝 Usage: bratv2 <text>", event.threadID, event.messageID);
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api.ferdev.my.id/maker/bratv2?text=${encodedText}&apikey=lain-lain`;
        const imagePath = path.join(__dirname, "cache", `bratv2_${Date.now()}.png`);

        api.sendMessage("🖼️ Generating Bratv2 image, please wait...", event.threadID, event.messageID);

        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                "Content-Type": "image/png"
            }
        });

        // Ensure the cache directory exists
        fs.mkdirSync(path.dirname(imagePath), { recursive: true });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
            } catch (sendErr) {
                console.error('Send Error:', sendErr);
                api.sendMessage("❌ Error sending the image.", event.threadID, event.messageID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream Error:', err);
            api.sendMessage("❌ Error writing the image file.", event.threadID, event.messageID);
        });
    } catch (err) {
        console.error('Unexpected Error:', err);
        api.sendMessage("❌ An error occurred while generating the image.", event.threadID, event.messageID);
    }
};