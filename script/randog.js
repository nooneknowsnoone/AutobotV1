const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "randog",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Get a random dog image",
    hasPrefix: false,
    aliases: ["randomdog", "doggo"],
    usage: "[randog]",
    cooldown: 3
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const API_URL = "https://kaiz-apis.gleeze.com/api/randomdog?apikey=52c32711-e257-448e-b96d-06d86f77e6a4";

    try {
        const response = await axios.get(API_URL);
        const imageUrl = response.data.imageUrl;

        if (!imageUrl) {
            return api.sendMessage("🐶 No dog image found for you right now!", threadID, messageID);
        }

        const filename = `dog_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, filename);

        const imgRes = await axios({ url: imageUrl, method: "GET", responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        imgRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        await api.sendMessage({
            attachment: fs.createReadStream(filePath)
        }, threadID);

        fs.unlinkSync(filePath);

    } catch (error) {
        console.error("randog error:", error.message || error);
        api.sendMessage("❌ Error: Could not fetch dog image.", threadID, messageID);
    }
};