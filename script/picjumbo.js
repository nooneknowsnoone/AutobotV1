const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "picjumbo",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Search free stock images from Picjumbo",
    hasPrefix: false,
    aliases: ["stockphoto", "pjumbo"],
    usage: "[picjumbo <query> | <page>]",
    cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
        return api.sendMessage(
            "📸 Usage: picjumbo <query> | <page>\nExample: picjumbo dog | 1",
            threadID,
            messageID
        );
    }

    const input = args.join(" ").split("|");
    const query = input[0]?.trim();
    const page = parseInt(input[1]?.trim()) || 1;

    if (!query) {
        return api.sendMessage(
            "❌ Please provide a search query.\nExample: picjumbo cat | 2",
            threadID,
            messageID
        );
    }

    try {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/picjumbo?search=${encodeURIComponent(query)}&page=${page}&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633`;
        const response = await axios.get(apiUrl);
        const { images, total } = response.data;

        if (!images || images.length === 0) {
            return api.sendMessage(`❌ No images found for "${query}" on page ${page}.`, threadID, messageID);
        }

        for (const url of images) {
            const filename = `picjumbo_${Date.now()}.jpg`;
            const filePath = path.join(__dirname, filename);

            const imageResponse = await axios({
                url,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(filePath);
            imageResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            await api.sendMessage(
                { attachment: fs.createReadStream(filePath) },
                threadID
            );

            fs.unlinkSync(filePath);
        }

        await api.sendMessage(
            `✅ Total results: ${total} | Search: "${query}" | Page: ${page}`,
            threadID
        );

    } catch (error) {
        console.error("Picjumbo Command Error:", error);
        api.sendMessage(
            `❌ Failed to retrieve images.\nError: ${error.message || error}`,
            threadID
        );
    }
};