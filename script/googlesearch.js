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
  name: 'googlesearch',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gsearch', 'gs'],
  description: "Search Google for results using a fast API",
  usage: "google [query]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!query) {
    return api.sendMessage(formatFont("❌ Please enter a Google search query."), threadID, messageID);
  }

  api.sendMessage(formatFont("🔍 𝗚𝗼𝗼𝗴𝗹𝗲 𝗶𝘀 𝘀𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get(`https://rapido.zetsu.xyz/api/google?q=${encodeURIComponent(query)}`);

      if (!data?.results?.length) {
        return api.editMessage(formatFont("❌ No results found."), info.messageID);
      }

      const results = data.results.slice(0, 5).map((result, i) => 
        `${i + 1}. 📄 ${result.title}\n🔗 ${result.link}\n📝 ${result.snippet}`
      ).join('\n\n');

      const userInfo = await new Promise(resolve => {
        api.getUserInfo(senderID, (err, result) => {
          if (err) resolve({});
          else resolve(result[senderID]);
        });
      });

      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

      const finalMessage = `
🌐 𝗚𝗢𝗢𝗚𝗟𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧𝗦
━━━━━━━━━━━━━━━━━━
${results}
━━━━━━━━━━━━━━━━━━
🔍 𝗤𝘂𝗲𝗿𝘆: ${query}
🗣 𝗦𝗲𝗮𝗿𝗰𝗵𝗲𝗱 𝗯𝘆: ${userInfo?.name || 'User'}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

      api.editMessage(formatFont(finalMessage), info.messageID);

    } catch (error) {
      console.error("Google Search Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};