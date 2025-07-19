const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "shoti",
    version: "1.0.0",
    role: 0,
    description: "Fetch a random Shoti video.",
    hasPrefix: false,
    credits: "Akimitsu",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event }) {
    try {
        // Inform user about the fetching process
        api.sendMessage("🎬 𝖥𝖾𝗍𝖼𝗁𝗂𝗇𝗀 𝗌𝗁𝗈𝗍𝗂 𝗏𝗂𝖽𝖾𝗈 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍..", event.threadID, event.messageID);

        // API call
        const response = await axios.get('https://shoti.fbbot.org/api/get-shoti?type=video', {
            headers: {
                apikey: '$shoti-54c9a5966a',
            },
        });

        const data = response.data?.result;
        if (!data || !data.content) {
            return api.sendMessage('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗮 𝗦𝗵𝗼𝘁𝗶 𝘃𝗶𝗱𝗲𝗼. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const downloadResponse = await axios({
            method: 'GET',
            url: data.content,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        downloadResponse.data.pipe(writer);

        writer.on('finish', async () => {
            api.sendMessage({
                body: '🎥 𝖧𝖾𝗒𝗒!',
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // Cleanup
            }, event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 𝗘𝗿𝗿𝗼𝗿 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘁𝗵𝗲 𝘃𝗶𝗱𝗲𝗼. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.', event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('Error fetching Shoti video:', error);
        api.sendMessage('🚫 𝗘𝗿𝗿𝗼𝗿 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗦𝗵𝗼𝘁𝗶 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.', event.threadID, event.messageID);
    }
};