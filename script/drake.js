const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "drake",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Generates a Drake meme with two custom texts.",
    hasPrefix: true,
    aliases: ["drake"],
    usage: "[drake <text1> | <text2>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length < 1) {
        return api.sendMessage("❌ Usage: drake <text1> | <text2>\nExample: drake amongus | amogus", threadID, messageID);
    }

    const input = args.join(" ").split("|").map(t => t.trim());
    if (input.length < 2) {
        return api.sendMessage("❌ Error: Please provide two texts separated by '|'", threadID, messageID);
    }

    const [text1, text2] = input;
    const url = `https://api.popcat.xyz/v2/drake?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
    const filePath = path.join(__dirname, `drake_${Date.now()}.png`);

    try {
        api.sendMessage("📸 Generating your Drake meme, please wait...", threadID, messageID);

        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

        await api.sendMessage({
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
        
    } catch (error) {
        console.error("Drake Error:", error.message);
        api.sendMessage("❌ Failed to generate meme.", threadID, messageID);
    }
};