module.exports.config = {
    name: "fbpfp",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Fetch a Facebook profile picture using UID",
    hasPrefix: false,
    aliases: ["pfp", "facebookpfp"],
    usage: "[fbpfp <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        // Get UID from arguments
        const uid = args[0];

        // Validate UID
        if (!uid || isNaN(uid)) {
            api.sendMessage("Usage: fbpfp <uid>\nExample: fbpfp 1000123456789", event.threadID);
            return;
        }

        // Construct the API URL
        const encodedUID = encodeURIComponent(uid);
        const url = `https://kaiz-apis.gleeze.com/api/facebookpfp?uid=${encodedUID}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;
        const imagePath = path.join(__dirname, "fbpfp.jpg");

        // Notify the user
        api.sendMessage("Fetching Facebook profile picture, please wait...", event.threadID);

        // Request the image
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Save image to file
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // On successful write, send the image
        writer.on('finish', async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle stream errors
        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};