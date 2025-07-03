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
  name: 'sutra',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['asksutra'],
  description: "Ask a deep question and get wisdom from Sutra AI.",
  usage: "sutra [question]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const question = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!question) {
    return api.sendMessage(formatFont("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗳𝗼𝗿 𝗦𝘂𝘁𝗿𝗮 𝗔𝗜.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: sutra What is love?"), threadID, messageID);
  }

  api.sendMessage(formatFont("🧘‍♂️ 𝗦𝘂𝘁𝗿𝗮 𝗜𝗦 𝗧𝗛𝗜𝗡𝗞𝗜𝗡𝗚..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/sutra", {
        params: {
          ask: question,
          onlineSearch: false,
          apikey: "86397083-298d-4b97-a76e-414c1208beae"
        }
      });

      const responseText = data.response || "❌ 𝗡𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝗦𝘂𝘁𝗿𝗮 𝗔𝗜.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const reply = `
🧘‍♂️ 𝗦𝗨𝗧𝗥𝗔 𝗔𝗜
━━━━━━━━━━━━━━━━━━
${responseText}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(reply), info.messageID);
      });

    } catch (error) {
      console.error("Sutra Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};