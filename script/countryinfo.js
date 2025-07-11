const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "countryinfo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get detailed information about a country.",
  usage: "countryinfo {countryName}",
  credits: "Ry",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(" ").trim();
  if (!query) {
    return api.sendMessage("❌ Please provide a country name.\n\nExample: countryinfo Japan", threadID, messageID);
  }

  const countryApiUrl = `https://country-info-eta.vercel.app/kshitiz?name=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(countryApiUrl);
    const {
      name,
      officialName,
      capital,
      region,
      subregion,
      population,
      area,
      languages,
      flag,
      coatOfArms,
      currency
    } = response.data;

    const countryDetails = `
🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻
🏛 Name: ${name}
📜 Official Name: ${officialName}
🏙 Capital: ${capital}
🌎 Region: ${region}
📍 Subregion: ${subregion}
👥 Population: ${population}
📏 Area: ${area} km²
🗣 Languages: ${languages}
💰 Currency: ${currency}
    `.trim();

    // Send country details
    await api.sendMessage(countryDetails, threadID);

    // Handle and send both flag and coat of arms images
    const imageUrls = [flag, coatOfArms];

    for (const imageUrl of imageUrls) {
      if (!imageUrl) continue;

      const imagePath = path.join(__dirname, `countryimg_${Date.now()}.png`);
      const imgResponse = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(imagePath);
      imgResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await api.sendMessage({ attachment: fs.createReadStream(imagePath) }, threadID);
      fs.unlinkSync(imagePath);
    }

  } catch (error) {
    console.error("Country Info Error:", error.message);
    return api.sendMessage("❌ An error occurred while fetching country information.", threadID, messageID);
  }
};