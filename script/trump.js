module.exports.config = {
    name: "trump",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate an image with Trump holding your custom sign",
    hasPrefix: false,
    aliases: ["trump"],
    usage: "[trump <uid> | <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ").split("|").map(x => x.trim());
        const [uid, text] = input;

        if (!uid || !text) {
            api.sendMessage("❌ Usage: trump <uid> | <text>\nExample: trump 1000123456789 | my love still by you", event.threadID);
            return;
        }

        const url = `https://api-canvass.vercel.app/trump?userid=${uid}&text=${encodeURIComponent(text)}`;
        const imagePath = path.join(__dirname, "trump.png");

        api.sendMessage("🇺🇸 Generating Trump image, please wait...", event.threadID);

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath);
            } catch (sendErr) {
                console.error("Send error:", sendErr);
                api.sendMessage("❌ An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on("error", (err) => {
            console.error("Write stream error:", err);
            api.sendMessage("❌ Error saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("Trump Command Error:", error.message);
        api.sendMessage("❌ Failed to generate Trump image.", event.threadID);
    }
};