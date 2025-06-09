const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "randomcat",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Get random cat images",
    hasPrefix: false,
    aliases: ["randcat", "catto"],
    usage: "[randomcat]",
    cooldown: 3
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const API_URL = "https://kaiz-apis.gleeze.com/api/randomcat?limit=10&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633";

    try {
        const response = await axios.get(API_URL);
        const images = response.data.images;

        if (!images || images.length === 0) {
            return api.sendMessage("😿 No cat images found.", threadID, messageID);
        }

        for (const url of images) {
            const filename = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            const filePath = path.join(__dirname, filename);

            const imgRes = await axios({ url, method: "GET", responseType: "stream" });
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
        }

    } catch (error) {
        console.error("randomcat error:", error.message || error);
        api.sendMessage("❌ Error: Could not fetch cat images.", threadID, messageID);
    }
};