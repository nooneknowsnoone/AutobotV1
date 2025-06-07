const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "fbpfp",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Fetch a Facebook profile picture using UID",
    hasPrefix: false,
    aliases: ["pfp", "facebookpfp"],
    usage: "[fbpfp <uid>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const uid = args[0];
    if (!uid || isNaN(uid)) {
        return api.sendMessage("👤 Usage: fbpfp <uid>\nExample: fbpfp 1000123456789", threadID, messageID);
    }

    const url = `https://kaiz-apis.gleeze.com/api/facebookpfp?uid=${encodeURIComponent(uid)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;
    const imagePath = path.join(__dirname, `fbpfp_${Date.now()}.jpg`);

    try {
        api.sendMessage("⏳ Fetching Facebook profile picture, please wait...", threadID);

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
            api.sendMessage("❌ Error saving the profile picture.", threadID);
        });

    } catch (error) {
        console.error("fbpfp Command Error:", error.message);
        api.sendMessage("❌ Failed to fetch Facebook profile picture.", threadID);
    }
};