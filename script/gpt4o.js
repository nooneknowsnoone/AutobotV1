const axios = require('axios');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join('');
}

module.exports.config = {
  name: 'gpt4o',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['4o', 'openai4o'],
  description: "Chat with GPT-4o model using a smart assistant roleplay",
  usage: "gpt4o [message]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage(formatFont("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: gpt4o What can you do?"), threadID, messageID);
  }

  api.sendMessage(formatFont("🤖 𝗚𝗣𝗧-𝟰𝗼 𝗶𝘀 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗾𝘂𝗲𝗿𝘆..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get('https://haji-mix-api.gleeze.com/api/gpt4o', {
        params: {
          ask: prompt,
          uid: senderID,
          roleplay: "Smart Assistant",
          api_key: "f4a2fb31166ad43608b9a3aa4195ae1491ab497b3bead8ca77699afb5d149a6d"
        }
      });

      const answer = data.answer || "❌ 𝗡𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝗚𝗣𝗧-𝟰𝗼.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const reply = `
🤖 𝗚𝗣𝗧-𝟰𝗼 𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗗
━━━━━━━━━━━━━━━━━━
${answer}
━━━━━━━━━━━━━━━━━━
🗣 𝗙𝗿𝗼𝗺: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(reply), info.messageID);
      });

    } catch (error) {
      console.error("GPT-4o Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};