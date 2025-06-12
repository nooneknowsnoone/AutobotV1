const axios = require("axios");

module.exports.config = {
  name: "aidetectv2",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "AI Detector V2 - Checks how human your text is.",
  usage: "aidetectv2 <your text>",
  credits: "developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      "❌ 𝗘𝗿𝗿𝗼𝗿: Please provide text to analyze.\n\n📌 Example: aidetectv2 This sentence sounds human.",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/aidetectorv2?text=${encodeURIComponent(query)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const result = data.response;
    const humanPercent = result.is_human;
    const aiPercent = result.ai_percentage;
    const totalWords = result.total_word_count;
    const aiWords = result.ai_word_count;

    const message = `─────────────
🤖 𝗔𝗜 𝗗𝗲𝘁𝗲𝗰𝘁𝗼𝗿 𝗩𝟮
𝗛𝘂𝗺𝗮𝗻 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${humanPercent}%
𝗔𝗜 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${aiPercent}%
𝗧𝗼𝘁𝗮𝗹 𝗪𝗼𝗿𝗱𝘀: ${totalWords}
𝗔𝗜 𝗪𝗼𝗿𝗱𝘀: ${aiWords}
─────────────`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error("AIDetectorV2 error:", error.message);
    return api.sendMessage(
      "❌ Error: AI Detector V2 request failed.",
      threadID,
      messageID
    );
  }
};