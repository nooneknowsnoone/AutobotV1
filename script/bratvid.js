const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "bratvid",
    version: "1.0.0",
    role: 0,
    description: "Generate a brat-style video from text.",
    prefix: false,
    premium: false,
    credits: "dev",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    const text = args.join(" ");
    const { threadID, messageID } = event;

    if (!text) {
        return api.sendMessage(
            "Please provide text after 'bratvid' to generate the video.",
            threadID,
            messageID
        );
    }

    api.sendMessage("Generating video, please wait...", threadID, messageID);

    try {
        const videoUrl = `https://api.ferdev.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;
        const fileName = `${messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const downloadResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        downloadResponse.data.pipe(writer);

        writer.on('finish', async () => {
            api.sendMessage({
                body: 'Here is your brat video!',
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                fs.unlinkSync(filePath); // Cleanup
            }, messageID);
        });

        writer.on('error', () => {
            api.sendMessage('Error downloading the video. Please try again.', threadID, messageID);
        });

    } catch (error) {
        console.error('Error generating brat video:', error);
        api.sendMessage('Error generating video. Try again later.', threadID, messageID);
    }
};