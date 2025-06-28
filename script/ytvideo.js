const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "ytvideo",
    version: "1.0.0",
    role: 0,
    description: "Search and download YouTube video by keyword.",
    prefix: false,
    premium: false,
    credits: "Ry",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    if (!args[0]) {
        return api.sendMessage('❗ Please enter a YouTube keyword to search.', event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(' '));
    const url = `https://kaiz-apis.gleeze.com/api/video?query=${query}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

    try {
        api.sendMessage("🔎 Searching YouTube video, please wait...", event.threadID, event.messageID);

        const { data } = await axios.get(url);

        if (!data || !data.download_url) {
            return api.sendMessage('❌ No video found. Try a different keyword.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const download = await axios({
            method: 'GET',
            url: data.download_url,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        download.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 Title: ${data.title}\n👤 Author: ${data.author}\n⏱ Duration: ${data.duration}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 Error downloading video. Try again.', event.threadID, event.messageID);
        });

    } catch (err) {
        console.error('YouTube video search error:', err);
        return api.sendMessage('⚠️ Failed to fetch YouTube video. Try again later.', event.threadID, event.messageID);
    }
};