const axios = require("axios");

module.exports.config = {
  name: "citizendium",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Fetch information from Citizendium library.",
  usage: "citizendium <word>",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage(
      "❌ 𝗨𝘀𝗮𝗴𝗲: 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘄𝗼𝗿𝗱 𝗼𝗿 𝗽𝗵𝗿𝗮𝘀𝗲.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: citizendium cat",
      threadID,
      messageID
    );
  }

  await api.sendMessage("⌛ 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...", threadID);

  try {
    const apiUrl = `https://jerome-web.gleeze.com/service/api/citizendium?word=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    const { title, description, source } = data;

    if (!description) {
      return api.sendMessage(`❌ No information found for the query: "${query}".`, threadID, messageID);
    }

    const message = `📘 𝗧𝗶𝘁𝗹𝗲: ${title}\n\n${description}\n\n📚 𝗦𝗼𝘂𝗿𝗰𝗲: ${source}`;
    return api.sendMessage(message.trim(), threadID, messageID);

  } catch (error) {
    console.error("❌ Error fetching information:", error.message || error.response?.data);
    return api.sendMessage(
      "❌ An error occurred while fetching the information. Please try again later.",
      threadID,
      messageID
    );
  }
};