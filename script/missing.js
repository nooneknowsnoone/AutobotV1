module.exports.config = {
    name: "missing",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a missing person poster with name, userid, and phone number",
    hasPrefix: false,
    aliases: ["missing"],
    usage: "[missing <name> | <userid> | <number>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const input = args.join(" ").split("|").map(i => i.trim());
        const name = input[0];
        const userid = input[1];
        const number = input[2];

        if (!name || !userid || !number) {
            return api.sendMessage("❌ Usage: missing <name> | <userid> | <number>\nExample: missing Mark Zuckerberg | 4 | 098737365", event.threadID);
        }

        const url = `https://api-canvass.vercel.app/missing?userid=${encodeURIComponent(userid)}&name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}`;
        const imagePath = path.join(__dirname, `missing_${Date.now()}.png`);

        api.sendMessage("📋 Generating missing person poster, please wait...", event.threadID);

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
                console.error('Error sending image:', sendError);
                api.sendMessage("❌ Error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', err => {
            console.error('Stream writer error:', err);
            api.sendMessage("❌ Error occurred while saving the image.", event.threadID);
        });

    } catch (error) {
        console.error("Missing Command Error:", error);
        api.sendMessage("❌ Failed to generate missing person poster.", event.threadID);
    }
};