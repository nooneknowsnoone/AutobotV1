const axios = require("axios");

module.exports.config = {
  name: "qtext",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Creates a QText.io message link from input text.",
  usage: "qtext <your text>",
  credits: "developer",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!args || args.length === 0) {
    return api.sendMessage("𝗨𝘀𝗮𝗴𝗲: qtext <text>", threadID, messageID);
  }

  const textInput = args.join(" ");
  const apiUrl = `https://kaiz-apis.gleeze.com/api/qtext-io?text=${encodeURIComponent(textInput)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.url) {
      return api.sendMessage("❌ Failed to generate QText.io link.", threadID, messageID);
    }

    const message = `🔗 𝗟𝗶𝗻𝗸: ${data.url}\n⏳ 𝗘𝘅𝗽𝗶𝗿𝗲𝘀 𝗶𝗻: 𝟭𝟱 𝗺𝗶𝗻𝘂𝘁𝗲𝘀`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error("QText command error:", error.message);
    return api.sendMessage("❌ 𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗤𝗧𝗲𝘅𝘁 𝗹𝗶𝗻𝗸.", threadID, messageID);
  }
};