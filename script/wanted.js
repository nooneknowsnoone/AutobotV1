module.exports.config = {
    name: "wanted",
    version: "1.0.0",
    role: 0,
    credits: "Rized",  // Updated credit name
    description: "Generate a wanted poster from a user's profile photo",
    hasPrefix: false,
    aliases: ["wanted"],
    usage: "[wanted <uid>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        // Get the UID from the first argument
        const uid = args[0];

        // Validate UID input
        if (!uid || isNaN(uid)) {
            api.sendMessage("Usage: wanted <uid>\nExample: wanted 1000123456789", event.threadID);
            return;
        }

        // Construct the API URL
        const url = `https://betadash-api-swordslush-production.up.railway.app/wanted?userid=${uid}`;
        const imagePath = path.join(__dirname, "wanted.png");

        // Notify the user that the image is being generated
        api.sendMessage("Generating your wanted poster, please wait...", event.threadID);

        // Fetch the image from the API
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Create a writable stream to save the image
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // Handle the finish event of the writable stream
        writer.on('finish', async () => {
            try {
                // Send the image as an attachment
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);

                // Clean up the file after sending
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle errors during the writing process
        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};