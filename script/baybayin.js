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
  name: 'baybayin',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['bay2'],
  description: "Translate text to Baybayin script",
  usage: "baybayin [text]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const inputText = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!inputText) {
    return api.sendMessage(formatFont("❌ Please enter a word or phrase to convert to Baybayin."), threadID, messageID);
  }

  api.sendMessage(formatFont("🔡 𝗧𝗥𝗔𝗡𝗦𝗟𝗔𝗧𝗜𝗡𝗚 𝗧𝗢 𝗕𝗔𝗬𝗕𝗔𝗬𝗜𝗡..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get("https://wildan-suldyir-apis.vercel.app/api/baybayin", {
        params: { text: inputText }
      });

      if (!data.status || !data.result) {
        return api.editMessage(formatFont("❌ Failed to translate the text."), info.messageID);
      }

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const translated = `
🔤 𝗕𝗔𝗬𝗕𝗔𝗬𝗜𝗡 𝗧𝗥𝗔𝗡𝗦𝗟𝗔𝗧𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━
📥 𝗜𝗻𝗽𝘂𝘁: ${inputText}
📜 𝗕𝗮𝘆𝗯𝗮𝘆𝗶𝗻: ${data.result}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}
        `.trim();

        api.editMessage(formatFont(translated), info.messageID);
      });

    } catch (err) {
      console.error("Baybayin API Error:", err);
      const errorMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Unknown error.");
      api.editMessage(formatFont(errorMsg), info.messageID);
    }
  });
};