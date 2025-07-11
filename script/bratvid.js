const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "bratvid",
    version: "1.0.0",
    role: 0,
    description: "Generate a brat-style video/gif from text.",
    hasPrefix: true,
    credits: "dev",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text) {
        return api.sendMessage('Please provide text after "bratvid" to generate the video.', event.threadID, event.messageID);
    }

    api.sendMessage('Generating video, please wait...', event.threadID, event.messageID);

    const encodedText = encodeURIComponent(text);
    const videoUrl = `https://api.ferdev.my.id/maker/bratvid?text=${encodedText}&apikey=lain-lain`;
    const fileName = `${event.messageID}_bratvid.mp4`;
    const filePath = path.join(__dirname, fileName);

    try {
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `•Brat video for: "${text}"`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('Error writing video file. Try again.', event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('Bratvid error:', error);
        return api.sendMessage('Failed to generate brat video. Please try again later.', event.threadID, event.messageID);
    }
};