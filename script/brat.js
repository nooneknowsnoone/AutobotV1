module.exports.config = {
    name: "brat",
    version: "1.0.0",
    role: 0,
    credits: "Rized", // Update if needed
    description: "Generate a Bratz-style image with custom text",
    hasPrefix: false,
    aliases: ["brat"],
    usage: "[brat <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
        return api.sendMessage("❌ Please provide text.\nUsage: brat <text>", threadID, messageID);
    }

    const text = args.join(" ");
    const apiUrl = `https://api.zetsu.xyz/gen/brat?text=${encodeURIComponent(text)}&apikey=80836f3451c2b3392b832988e7b73cdb`;
    const tempPath = path.join(__dirname, `brat_${Date.now()}.png`);

    try {
        api.sendMessage("📃 Generating Brat image, please wait...", threadID);

        const response = await axios.get(apiUrl, { responseType: "stream" });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            await api.sendMessage(
                {
                    body: "✨ Here's your Bratz-style image!",
                    attachment: fs.createReadStream(tempPath)
                },
                threadID
            );
            fs.unlinkSync(tempPath);
        });

        writer.on("error", (err) => {
            console.error("Stream error:", err);
            api.sendMessage("❌ Failed to process image stream.", threadID);
        });

    } catch (error) {
        console.error("Brat Error:", error.message);
        api.sendMessage("❌ Failed to generate image.", threadID);
    }
};