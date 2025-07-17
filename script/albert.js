const axios = require('axios');

module.exports.config = {
  name: 'albert',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['einstein', 'ae'],
  description: "Ask Albert Einstein a question",
  usage: "albert [your question]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const question = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!question) {
    return api.sendMessage("❌ Please provide a question for Albert Einstein.\n\nExample:\n`albert What is the definition of love?`", threadID, messageID);
  }

  // Bold text using Unicode characters
  const boldText = "🧠 𝗔𝗦𝗞𝗜𝗡𝗚 𝗔𝗟𝗕𝗘𝗥𝗧 𝗘𝗜𝗡𝗦𝗧𝗘𝗜𝗡...";

  api.sendMessage(boldText, threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://markdevs-last-api-p2y6.onrender.com/genuines-ai?name=Albert%20Einstein&question=${encodeURIComponent(question)}`;
      const { data } = await axios.get(url);

      const answer = data.result || "⚠️ No response received.";
      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US');

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply = `👨‍🔬 𝗔𝗟𝗕𝗘𝗥𝗧 𝗘𝗜𝗡𝗦𝗧𝗘𝗜𝗡:\n━━━━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("Albert command error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};