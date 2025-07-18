const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "onlytik",
    version: "1.0.0",
    role: 2,
    description: "Fetch a random TikTok video from OnlyTik API.",
    hasPrefix: true,
    credits: "Ry",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event }) {
    try {
        api.sendMessage("📥 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗮 𝗧𝗶𝗸𝗧𝗼𝗸 𝘃𝗶𝗱𝗲𝗼, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...", event.threadID, event.messageID);

        const res = await axios.get('https://haji-mix-api.gleeze.com/api/onlytik?stream=true&api_key=f4a2fb31166ad43608b9a3aa4195ae1491ab497b3bead8ca77699afb5d149a6d');
        const videoUrl = res.data?.result?.video;

        if (!videoUrl) {
            return api.sendMessage('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗴𝗲𝘁 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const videoStream = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎥 𝗥𝗮𝗻𝗱𝗼𝗺 𝗧𝗶𝗸𝗧𝗼𝗸 𝗩𝗶𝗱𝗲𝗼`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 𝗘𝗿𝗿𝗼𝗿 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘁𝗵𝗲 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.', event.threadID, event.messageID);
        });

    } catch (error) {
        console.error("❌ Error in onlytik command:", error);
        api.sendMessage('🚫 𝗘𝗿𝗿𝗼𝗿 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.', event.threadID, event.messageID);
    }
};