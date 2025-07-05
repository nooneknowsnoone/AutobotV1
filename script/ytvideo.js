const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "ytvideo",
    version: "1.0.0",
    role: 0,
    description: "Search and stream YouTube videos by keyword.",
    prefix: false,
    premium: false,
    credits: "Gestures5",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    if (!args[0]) {
        return api.sendMessage('❗ Please enter a YouTube keyword.', event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(' '));
    const url = `https://haji-mix-api.gleeze.com/api/youtube?search=${query}&stream=true&limit=1&api_key=4c756515a406d4ffafae6d6b06dcaeb8017b3634df0c07661a508b5b6a585df4`;

    try {
        api.sendMessage("🔎 Searching and streaming YouTube video, please wait...", event.threadID, event.messageID);

        const { data } = await axios.get(url);

        // Ensure the result contains a video URL (should be .mp4)
        const result = data?.data?.[0];
        if (!result || !result.url || !result.url.endsWith('.mp4')) {
            return api.sendMessage('❌ No YouTube video found or no video stream available. Try a different keyword.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const download = await axios({
            method: 'GET',
            url: result.url,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        download.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 Title: ${result.title || 'Unknown'}\n👤 Channel: ${result.channel || 'Unknown'}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 Error downloading video. Try again.', event.threadID, event.messageID);
        });

    } catch (err) {
        console.error('YouTube search error:', err);
        return api.sendMessage('⚠️ Failed to fetch YouTube video. Try again later.', event.threadID, event.messageID);
    }
};