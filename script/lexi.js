const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "lexi",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Lexi-themed image using text",
    hasPrefix: false,
    aliases: ["lexi"],
    usage: "[lexi <text>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const text = args.join(" ");
    if (!text) {
        return api.sendMessage("💬 Usage: lexi <text>\nExample: lexi Hello world", threadID, messageID);
    }

    const url = `https://betadash-api-swordslush-production.up.railway.app/lexi?text=${encodeURIComponent(text)}`;
    const imagePath = path.join(__dirname, `lexi_${Date.now()}.png`);

    try {
        api.sendMessage("⏳ Generating Lexi image, please wait...", threadID);

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
            console.error("Write stream error:", err);
            api.sendMessage("❌ Error saving the image.", threadID);
        });

    } catch (error) {
        console.error("Lexi Command Error:", error.message);
        api.sendMessage("❌ Failed to generate Lexi image.", threadID);
    }
};