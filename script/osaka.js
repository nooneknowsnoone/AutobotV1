module.exports.config = {    
    name: "osaka",    
    version: "1.0.0",    
    role: 0,    
    credits: "Rized",    
    description: "Generate an Osaka-themed image using a user ID",    
    hasPrefix: false,    
    aliases: ["osaka"],    
    usage: "[osaka <userid>]",    
    cooldown: 5    
};    
    
const axios = require("axios");    
const fs = require("fs");    
const path = require("path");    
    
module.exports.run = async function({ api, event, args }) {    
    try {    
        // Get the user ID from the arguments    
        const userId = args[0]?.trim();    
    
        // Validate the input    
        if (!userId) {    
            api.sendMessage("Usage: osaka <userid>\nExample: osaka 6", event.threadID);    
            return;    
        }    
    
        // Construct the API URL    
        const url = `https://betadash-api-swordslush-production.up.railway.app/osaka?userid=${userId}`;    
        const imagePath = path.join(__dirname, `osaka_${Date.now()}.png`);    
    
        // Notify the user    
        api.sendMessage("Generating Osaka image, please wait...", event.threadID);    
    
        // Fetch the image    
        const response = await axios({    
            url: url,    
            method: 'GET',    
            responseType: 'stream'    
        });    
    
        // Stream and save the image    
        const writer = fs.createWriteStream(imagePath);    
        response.data.pipe(writer);    
    
        // On finish, send the image    
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
    
        // Handle writing errors    
        writer.on('error', (err) => {    
            console.error('Stream writer error:', err);    
            api.sendMessage("An error occurred while processing the request.", event.threadID);    
        });    
    } catch (error) {    
        console.error('Error:', error);    
        api.sendMessage("An error occurred while processing the request.", event.threadID);    
    }    
};