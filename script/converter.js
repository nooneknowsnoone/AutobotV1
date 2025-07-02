const axios = require("axios");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  return text.split("").map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join("");
}

module.exports.config = {
  name: "converter",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["convert", "related"],
  description: "Convert your topic into relevant keywords or suggestions.",
  usage: "converter <word or topic>",
  credits: "Ry",
  cooldown: 2
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const { threadID, messageID, senderID } = event;

  if (!query) {
    return api.sendMessage(formatFont("❗ Please provide a topic or question."), threadID, messageID);
  }

  api.sendMessage(formatFont("🔄 𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗶𝗻𝗴 𝗾𝘂𝗲𝗿𝘆..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get(`https://xvi-rest-api.vercel.app/api/question/to/converter?question=${encodeURIComponent(query)}`);
      const keywords = data.response || "❌ No keywords found.";

      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString("en-US", { hour12: false });

      const msg = `
🧠 𝗧𝗢𝗣𝗜𝗖 𝗞𝗘𝗬𝗪𝗢𝗥𝗗 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥
━━━━━━━━━━━━━━━━━━━━
${keywords}
━━━━━━━━━━━━━━━━━━━━
📌 𝗤𝘂𝗲𝗿𝘆: ${query}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}
      `.trim();

      api.editMessage(formatFont(msg), info.messageID);

    } catch (err) {
      console.error("Converter error:", err);
      api.editMessage(formatFont("❌ Error: " + (err.message || "Unknown error.")), info.messageID);
    }
  });
};