const axios = require("axios");

module.exports.config = {
    name: "imdb",
    version: "1.0.0",
    role: 0,
    credits: "Rized",  // Updated credit name
    description: "Search for a movie's IMDb details",
    hasPrefix: false,
    aliases: ["movie", "film"],
    usage: "[imdb <movie name>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const query = args.join(" ");

        if (!query) {
            api.sendMessage("Usage: imdb <movie name>", event.threadID);
            return;
        }

        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.popcat.xyz/v2/imdb?q=${encodedQuery}`;

        api.sendMessage(`🔍 Searching IMDb for: ${query}...`, event.threadID);

        const res = await axios.get(url);
        const data = res.data.message;

        if (res.data.error || !data) {
            api.sendMessage("❌ Could not find any movie with that name.", event.threadID);
            return;
        }

        const imdbMessage = 
`🎬 𝗧𝗶𝘁𝗹𝗲: ${data.title}
📅 𝗬𝗲𝗮𝗿: ${data.year}
⏱️ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${data.runtime}
📽️ 𝗚𝗲𝗻𝗿𝗲𝘀: ${data.genres}
👨‍🎤 𝗔𝗰𝘁𝗼𝗿𝘀: ${data.actors}
🎥 𝗗𝗶𝗿𝗲𝗰𝘁𝗼𝗿: ${data.director}
🖋️ 𝗪𝗿𝗶𝘁𝗲𝗿: ${data.writer}
📜 𝗣𝗹𝗼𝘁: ${data.plot}
🏆 𝗔𝘄𝗮𝗿𝗱𝘀: ${data.awards}
🌐 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲𝘀: ${data.languages}
📈 𝗥𝗮𝘁𝗶𝗻𝗴𝘀:
 - IMDb: ${data.ratings[0]?.value || "N/A"}
 - Rotten Tomatoes: ${data.ratings[1]?.value || "N/A"}
 - Metacritic: ${data.ratings[2]?.value || "N/A"}
💵 𝗕𝗼𝘅 𝗢𝗳𝗳𝗶𝗰𝗲: ${data.boxoffice || "N/A"}
🔗 𝗜𝗠𝗗𝗯 𝗟𝗶𝗻𝗸: ${data.imdburl}`;

        // Send the text along with poster if available
        if (data.poster) {
            const img = (await axios.get(data.poster, { responseType: 'stream' })).data;
            api.sendMessage({
                body: imdbMessage,
                attachment: img
            }, event.threadID);
        } else {
            api.sendMessage(imdbMessage, event.threadID);
        }

    } catch (err) {
        console.error("Error:", err);
        api.sendMessage("❌ An error occurred while fetching the movie data.", event.threadID);
    }
};