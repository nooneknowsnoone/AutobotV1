const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
const DOWNLOAD_URL = 'https://api.zetsu.xyz/download/youtube';
const SEARCH_API_KEY = '0c1e7e33-d809-48a6-9e92-d6691a722633';
const DOWNLOAD_API_KEY = '80836f3451c2b3392b832988e7b73cdb';

module.exports.config = {
    name: "ytvideo",
    version: "1.0.0",
    role: 0,
    description: "Search YouTube videos and download the best format.",
    prefix: false,
    premium: false,
    credits: "converted by you",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
        return api.sendMessage('❗ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗾𝘂𝗲𝗿𝘆.', threadID, messageID);
    }

    const query = encodeURIComponent(args.join(" "));

    try {
        api.sendMessage("🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗳𝗼𝗿 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝘃𝗶𝗱𝗲𝗼, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...", threadID, messageID);

        // Step 1: Search for the video
        const searchRes = await axios.get(SEARCH_URL, {
            params: {
                q: query,
                apikey: SEARCH_API_KEY
            }
        });

        const video = searchRes.data?.items?.[0];
        if (!video) {
            return api.sendMessage('❌ 𝗡𝗼 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝘂𝗻𝗱. 𝗧𝗿𝘆 𝗮𝗻𝗼𝘁𝗵𝗲𝗿 𝗸𝗲𝘆𝘄𝗼𝗿𝗱.', threadID, messageID);
        }

        const { title, url, thumbnail } = video;

        // Step 2: Fetch download links
        const downloadRes = await axios.get(DOWNLOAD_URL, {
            params: {
                url,
                apikey: DOWNLOAD_API_KEY
            }
        });

        const result = downloadRes.data?.result;
        const bestMedia = result?.medias?.find(m => m.ext === 'mp4') || result?.medias?.[0];

        if (!bestMedia?.url) {
            return api.sendMessage('⚠️ 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝘃𝗶𝗱𝗲𝗼 𝗳𝗼𝗿𝗺𝗮𝘁 𝗳𝗼𝘂𝗻𝗱.', threadID, messageID);
        }

        const fileName = `${messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        // Step 3: Download video stream
        const download = await axios({
            method: 'GET',
            url: bestMedia.url,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        download.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 𝗧𝗶𝘁𝗹𝗲: ${result.title.slice(0, 80)}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${result.duration || 'N/A'}\n📺 𝗤𝘂𝗮𝗹𝗶𝘁𝘆: ${bestMedia.label || 'Unknown'}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗮𝘃𝗲 𝘁𝗵𝗲 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.', threadID, messageID);
        });

    } catch (error) {
        console.error('YouTube search error:', error);
        return api.sendMessage('⚠️ 𝗘𝗿𝗿𝗼𝗿 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗼𝗿 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘃𝗶𝗱𝗲𝗼.', threadID, messageID);
    }
};