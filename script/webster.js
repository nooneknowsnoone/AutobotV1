const axios = require('axios');

module.exports.config = {
  name: 'webster',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Look up word definitions via Webster API",
  usage: "webster [word]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const word = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!word) {
    return api.sendMessage("❌ Please provide a word to look up.\n\nExample:\n`webster cat`", threadID, messageID);
  }

  const thinking = "📚 𝗟𝗼𝗼𝗸𝗶𝗻𝗴 𝘂𝗽 𝘁𝗵𝗲 𝗱𝗲𝗳𝗶𝗻𝗶𝘁𝗶𝗼𝗻...";
  api.sendMessage(thinking, threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://hershey-api.onrender.com/api/webster?word=${encodeURIComponent(word)}`;
      const { data } = await axios.get(url);

      if (!data || !data.definitions || data.definitions.length === 0) {
        return api.editMessage(`❌ No definitions found for "${word}".`, info.messageID);
      }

      // Format definitions (limit to 5)
      const topDefinitions = data.definitions.slice(0, 5).map((def, i) => `${i + 1}. ${def}`).join("\n");

      // Format examples (limit to 2)
      const topExamples = data.examples?.slice(0, 2).map((ex, i) => `${i + 1}. ${ex}`).join("\n") || "None found.";

      const response = `📖 𝗠𝗲𝗿𝗿𝗶𝗮𝗺-𝗪𝗲𝗯𝘀𝘁𝗲𝗿 𝗗𝗶𝗰𝘁𝗶𝗼𝗻𝗮𝗿𝘆\n━━━━━━━━━━━━━━━━━━\n🔤 𝗪𝗼𝗿𝗱: ${data.word}\n🔊 𝗣𝗮𝗿𝘁 𝗼𝗳 𝗦𝗽𝗲𝗲𝗰𝗵: ${data.partOfSpeech || "N/A"}\n\n📌 𝗗𝗲𝗳𝗶𝗻𝗶𝘁𝗶𝗼𝗻𝘀:\n${topDefinitions}\n\n💬 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n${topExamples}\n━━━━━━━━━━━━━━━━━━\n📅 𝗪𝗼𝗧𝗗: ${data.wordOfTheDay.word}\n🔗 ${data.wordOfTheDay.url}`;

      api.editMessage(response, info.messageID);
    } catch (error) {
      console.error("Webster command error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};