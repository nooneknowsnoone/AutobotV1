const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "jesus",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Jesus meme image with custom text",
    hasPrefix: false,
    aliases: ["jesus"],
    usage: "[jesus <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const text = args.join(" ").trim();
    if (!text) {
        return api.sendMessage("❌ Usage: jesus <text>\nExample: jesus cat", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/jesus?text=${encodeURIComponent(text)}`;
    const imagePath = path.join(__dirname, `jesus_${Date.now()}.png`);

    try {
        api.sendMessage("✝️ Generating Jesus image, please wait...", threadID);

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            await api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID);
            fs.unlinkSync(imagePath);
        });

        writer.on("error", err => {
            console.error("File write error:", err);
            api.sendMessage("❌ Error saving the image.", threadID);
        });

    } catch (error) {
        console.error("Jesus Command Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", threadID);
    }
};