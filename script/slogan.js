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
  name: 'slogan',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['slog', 'tagline'],
  description: 'Generate a catchy slogan based on a prompt',
  usage: 'slogan <your product or idea>',
  credits: 'PinoyGPT',
  cooldown: 3,
  category: 'ai'
};

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!keyword) {
    return api.sendMessage(formatFont("❌ Please enter a keyword or idea.\nExample: slogan coffee shop"), threadID, messageID);
  }

  api.sendMessage(formatFont("💡 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝘀𝗹𝗼𝗴𝗮𝗻..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.post("https://www.pinoygpt.com/api/generate_slogan.php", {
        description: keyword
      });

      if (!data.success || !data.slogan) {
        return api.editMessage(formatFont("⚠️ No slogan was generated."), info.messageID);
      }

      const userName = await new Promise((resolve) => {
        api.getUserInfo(senderID, (err, infoUser) => {
          resolve(infoUser?.[senderID]?.name || "Unknown");
        });
      });

      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

      const response = `
🎯 𝗦𝗟𝗢𝗚𝗔𝗡 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗
━━━━━━━━━━━━━━━━━━
"${data.slogan}"
━━━━━━━━━━━━━━━━━━
🗣 𝗞𝗲𝘆𝘄𝗼𝗿𝗱: ${keyword}
👤 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

      api.editMessage(formatFont(response), info.messageID);

    } catch (error) {
      console.error("Slogan API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unable to contact slogan API.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};