const axios = require('axios');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    formattedText += fontEnabled && fontMapping[char] ? fontMapping[char] : char;
  }
  return formattedText;
}

module.exports.config = {
  name: 'ai3',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['xgpt3', 'freegpt3'],
  description: "AI Chat using Free GPT-4 API",
  usage: "ai3 [your prompt]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage(formatFont("❌ Please enter a question or prompt."), threadID, messageID);
  }

  api.sendMessage(formatFont("🤖 𝗔𝗜 𝗜𝗦 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚 𝗬𝗢𝗨𝗥 𝗥𝗘𝗤𝗨𝗘𝗦𝗧..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get("https://x-free-apis-4-all.onrender.com/api/gpt4", {
        params: {
          prompt: prompt,
          uid: senderID
        }
      });

      const responseText = data.answer || "❌ No response received from the GPT-4 API.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false }); // GMT+8

        const replyMessage = `
🤖 𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘
━━━━━━━━━━━━━━━━━━
${responseText}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(replyMessage), info.messageID);
      });

    } catch (error) {
      console.error("AI3 Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};