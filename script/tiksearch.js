const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "tiksearch",
    version: "1.0.0",
    role: 0,
    description: "Search TikTok videos by keyword.",
    prefix: false,
    premium: false,
    credits: "Ry",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    if (!args[0]) {
        return api.sendMessage('❗ Please enter a TikTok keyword.', event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(' '));
    const url = `https://kaiz-apis.gleeze.com/api/tiksearch?search=${query}&apikey=8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10`;

    try {
        api.sendMessage("🔎 Searching TikTok videos, please wait...", event.threadID, event.messageID);

        const { data } = await axios.get(url);
        const video = data?.data?.videos?.[0];

        if (!video) {
            return api.sendMessage('❌ No TikTok video found. Try a different keyword.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const download = await axios({
            method: 'GET',
            url: video.play,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        download.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 Title: ${video.title.slice(0, 80)}\n👤 Author: ${video.author.nickname || video.author.unique_id}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 Error downloading video. Try again.', event.threadID, event.messageID);
        });

    } catch (err) {
        console.error('TikTok search error:', err);
        return api.sendMessage('⚠️ Failed to fetch TikTok video. Try again later.', event.threadID, event.messageID);
    }
};