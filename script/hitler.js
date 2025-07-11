module.exports.config = {    
    name: "hitler",    
    version: "1.0.0",    
    role: 0,    
    credits: "Rized",    
    description: "Generate a Hitler-themed meme image using a user ID",    
    hasPrefix: true,    
    aliases: ["hitler"],    
    usage: "[hitler <userid>]",    
    cooldown: 5    
};    
    
const axios = require("axios");    
const fs = require("fs");    
const path = require("path");    
    
module.exports.run = async function({ api, event, args }) {    
    try {    
        // Get the user ID from the first argument    
        const userId = args[0]?.trim();    
    
        // Check if user ID is provided    
        if (!userId) {    
            api.sendMessage("Usage: hitler <userid>\nExample: hitler 4", event.threadID);    
            return;    
        }    
    
        // Construct the API URL with properly encoded parameters    
        const encodedUserId = encodeURIComponent(userId);    
        const url = `https://api-canvass.vercel.app/hitler?userid=${encodedUserId}`;    
        const imagePath = path.join(__dirname, `hitler_${Date.now()}.png`);    
    
        // Notify the user that the image is being generated    
        api.sendMessage("Generating your Hitler image, please wait...", event.threadID);    
    
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