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
  name: 'research',
  version: '1.1.0',
  role: 0,
  hasPrefix: false,
  aliases: ['restitle', 'resgen'],
  description: "Generate a research title (qualitative, quantitative, or random)",
  usage: "research [topic] [qualitative|quantitative|random]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (args.length < 2) {
    return api.sendMessage(formatFont("❌ Usage: research [topic] [qualitative|quantitative|random]"), threadID, messageID);
  }

  let method = args.pop().toLowerCase();
  if (method === 'random') {
    method = Math.random() > 0.5 ? 'qualitative' : 'quantitative';
  }

  if (!['qualitative', 'quantitative'].includes(method)) {
    return api.sendMessage(formatFont("❌ Please choose: qualitative, quantitative, or random."), threadID, messageID);
  }

  const topic = args.join(" ").trim();

  api.sendMessage(formatFont("📄 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗜𝗡𝗚 𝗥𝗘𝗦𝗘𝗔𝗥𝗖𝗛 𝗧𝗜𝗧𝗟𝗘..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const prompt = `Generate a ${method} research title about: ${topic}`;
      const { data } = await axios.get("https://wildan-suldyir-apis.vercel.app/api/gemink", {
        params: { prompt }
      });

      const result = data.response?.trim() || "❌ No title generated.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString("en-US", { hour12: false });

        const reply = `
📚 𝗥𝗘𝗦𝗘𝗔𝗥𝗖𝗛 𝗧𝗜𝗧𝗟𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥
━━━━━━━━━━━━━━━━━━
📌 𝗧𝗼𝗽𝗶𝗰: ${topic}
🔬 𝗠𝗲𝘁𝗵𝗼𝗱: ${method.charAt(0).toUpperCase() + method.slice(1)}
📝 𝗧𝗶𝘁𝗹𝗲: ${result}
━━━━━━━━━━━━━━━━━━
🙋 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(reply), info.messageID);
      });

    } catch (err) {
      console.error("Research Error:", err);
      const errMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Unknown error.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};