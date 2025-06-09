const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "braveimg",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Search images using Brave Search",
    hasPrefix: false,
    aliases: ["braveimage", "brimg"],
    usage: "[braveimg <query> - <number>]",
    cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
        return api.sendMessage("📸 Usage: braveimg <query> - <amount>\nExample: braveimg cat - 5", threadID, messageID);
    }

    const [searchTerm, count] = args.join(" ").split(" - ");
    if (!searchTerm || !count) {
        return api.sendMessage("❌ Invalid input.\nUsage: braveimg dog - 3", threadID, messageID);
    }

    const numOfImages = parseInt(count) || 5;
    if (isNaN(numOfImages) || numOfImages < 1 || numOfImages > 30) {
        return api.sendMessage("❌ Please provide a valid number of images (1–30).", threadID, messageID);
    }

    try {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/brave-image?search=${encodeURIComponent(searchTerm)}&limit=${numOfImages}&apikey=97d2c598-c473-4f97-a3d5-e5ba73b50e17`;
        const response = await axios.get(apiUrl);

        const images = response.data.imageUrls;
        if (!images || images.length === 0) {
            return api.sendMessage(`❌ No images found for "${searchTerm}".`, threadID, messageID);
        }

        const urls = images.slice(0, numOfImages);
        for (const url of urls) {
            const filename = `braveimg_${Date.now()}.jpg`;
            const filePath = path.join(__dirname, filename);

            const imgRes = await axios({ url, method: "GET", responseType: "stream" });
            const writer = fs.createWriteStream(filePath);
            imgRes.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            await api.sendMessage({ attachment: fs.createReadStream(filePath) }, threadID);
            fs.unlinkSync(filePath);
        }

    } catch (error) {
        console.error("Brave Image Search Error:", error);
        api.sendMessage(`❌ Failed to retrieve images.\nError: ${error.message || error}`, threadID);
    }
};