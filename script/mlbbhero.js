const axios = require('axios');

module.exports.config = {
  name: "mlbbhero",
  version: "1.0.0",
  credits: "developer",
  description: "Get information about a Mobile Legends hero.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["mlhero", "mlheroinfo"]
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage("✦ Please provide a Mobile Legends hero name.\n\nExample: mlbbhero suyou", threadID, messageID);
  }

  const heroName = args.join(" ");
  const apiUrl = `https://kaiz-apis.gleeze.com/api/mlbb-heroes?name=${encodeURIComponent(heroName)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    const response = await axios.get(apiUrl);
    const heroData = response.data.response;

    if (!heroData) {
      return api.sendMessage("❌ Hero not found or invalid data received.", threadID, messageID);
    }

    const {
      heroName: name,
      alias,
      internalName,
      birthday,
      born,
      gender,
      species,
      affiliation,
      equipment,
      heroNumber,
      releaseDate,
      role,
      specialty,
      price,
      skillResource,
      damageType,
      basicAttackType,
      controlEffects,
      difficulty,
      thumbnail
    } = heroData;

    const info = `
🎮 𝗠𝗟𝗕𝗕 𝗛𝗲𝗿𝗼 𝗜𝗻𝗳𝗼
🏆 Name: ${name}
🗡 Alias: ${alias}
📛 Internal Name: ${internalName}
🎂 Birthday: ${birthday}
🏞 Born in: ${born}
🚻 Gender: ${gender}
🧬 Species: ${species}
🏛 Affiliation: ${affiliation}
🔱 Equipment: ${equipment}
#️⃣ Hero Number: ${heroNumber}
📅 Release Date: ${releaseDate}
🎭 Role: ${role}
🔥 Specialty: ${specialty}
💰 Price: ${price}
⚡ Skill Resource: ${skillResource}
⚔ Damage Type: ${damageType}
🛡 Basic Attack Type: ${basicAttackType}
🎮 Control Effects: ${controlEffects}
🎯 Difficulty: ${difficulty}`.trim();

    // Send hero info first
    api.sendMessage(info, threadID, async () => {
      // Then send the image if available
      if (thumbnail) {
        try {
          const imageStream = await axios.get(thumbnail, { responseType: 'stream' });
          await api.sendMessage({ attachment: imageStream.data }, threadID);
        } catch (imgErr) {
          console.error("Failed to load hero thumbnail:", imgErr.message);
        }
      }
    });

  } catch (error) {
    console.error("mlbbhero error:", error.message);
    api.sendMessage("❌ Failed to retrieve hero information. Please check the name and try again.", threadID, messageID);
  }
};