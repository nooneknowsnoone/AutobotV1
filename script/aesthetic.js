module.exports.config = {    
    name: "aesthetic",    
    version: "1.0.0",    
    role: 0,    
    credits: "Rized",    
    description: "Generate an aesthetic image with custom text and author (color: black or white only)",    
    hasPrefix: false,    
    aliases: ["aesthetic"],    
    usage: "[aesthetic <text> | <author> | <black|white>]",    
    cooldown: 5    
};    
    
const axios = require("axios");    
const fs = require("fs");    
const path = require("path");    
    
module.exports.run = async function({ api, event, args }) {    
    try {    
        const input = args.join(" ").split("|").map(part => part.trim());    
        const [text, author, color] = input;    
    
        // Validate required inputs    
        if (!text || !author || !color) {    
            return api.sendMessage("❌ Usage: aesthetic <text> | <author> | <black|white>\nExample: aesthetic Hello | cc | black/white", event.threadID);    
        }    
    
        // Validate allowed colors    
        const validColors = ["black", "white"];    
        if (!validColors.includes(color.toLowerCase())) {    
            return api.sendMessage("⚠️ Color must be either 'black' or 'white' only.", event.threadID);    
        }    
    
        const url = `https://jonell01-ccprojectsapihshs.hf.space/api/aesthetic?text=${encodeURIComponent(text)}&author=${encodeURIComponent(author)}&color=${encodeURIComponent(color)}`;    
        const imagePath = path.join(__dirname, `aesthetic_${Date.now()}.png`);    
    
        api.sendMessage("🎨 Generating aesthetic image, please wait...", event.threadID);    
    
        const response = await axios({    
            url: url,    
            method: 'GET',    
            responseType: 'stream'    
        });    
    
        const writer = fs.createWriteStream(imagePath);    
        response.data.pipe(writer);    
    
        writer.on('finish', async () => {    
            try {    
                await api.sendMessage({    
                    attachment: fs.createReadStream(imagePath)    
                }, event.threadID);    
                fs.unlinkSync(imagePath);    
            } catch (sendError) {    
                console.error('Error sending image:', sendError);    
                api.sendMessage("❌ Error sending the image.", event.threadID);    
            }    
        });    
    
        writer.on('error', (err) => {    
            console.error('Stream writer error:', err);    
            api.sendMessage("❌ Failed to write image file.", event.threadID);    
        });    
    } catch (error) {    
        console.error('Command error:', error);    
        api.sendMessage("❌ Failed to generate the image.", event.threadID);    
    }    
};