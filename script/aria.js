const axios = require('axios');
const cr = require('crypto');

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

function agent() {
  const chromeVersion = `${Math.floor(Math.random() * 6) + 130}.0.0.0`;
  const oprVersion = `${Math.floor(Math.random() * 5) + 86}.0.0.0`;
  return `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36 OPR/${oprVersion}`;
}

module.exports.config = {
  name: "aria",
  version: "1.1.0",
  credits: "dev (rest api)",
  hasPrefix: true,
  description: "Ask Opera Aria AI anything.",
  usage: "aria <question>",
  cooldown: 3,
  role: 0,
  hasPrefix: false,
  aliases: [],
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage(formatFont("❗ Please provide a question."), threadID, messageID);
  }

  api.sendMessage(formatFont("🤖 𝗔𝗥𝗜𝗔 𝗜𝗦 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚 𝗬𝗢𝗨𝗥 𝗥𝗘𝗤𝗨𝗘𝗦𝗧..."), threadID, async (err, info) => {
    if (err) return;

    try {
      const tokenParams = new URLSearchParams({
        client_id: 'ofa',
        grant_type: 'refresh_token',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5ODY3MTgyMTgiLCJjaWQiOiJvZmEiLCJ2ZXIiOiIyIiwiaWF0IjoxNzM1NTQ0MzAzLCJqdGkiOiJiOGRoV0Z4TTc3MTczNTU0NDMwMyJ9.EAJrJflcetOzXUdCfQve306QTe_h3Zac76XxjS5Xg1c',
        scope: 'shodan:aria user:read'
      }).toString();

      const tokenRes = await axios.post('https://oauth2.opera-api.com/oauth2/v1/token/', tokenParams, {
        headers: {
          'User-Agent': agent(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const accessToken = tokenRes.data.access_token;
      const encryptionKey = cr.randomBytes(32).toString('base64');

      const requestBody = {
        query: prompt,
        convertational_id: threadID,
        stream: false,
        linkify: true,
        linkify_version: 3,
        sia: true,
        supported_commands: [],
        media_attachments: [],
        encryption: { key: encryptionKey },
      };

      const response = await axios.post('https://composer.opera-api.com/api/v1/a-chat', requestBody, {
        headers: {
          'User-Agent': agent(),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-opera-ui-language': 'en, tl',
          'accept-language': 'en-US, tl-PH;q=0.9, *;q=0',
          'sec-ch-ua': '"OperaMobile";v="86", ";Not A Brand";v="99", "Opera";v="115", "Chromium";v="130"',
          'sec-ch-ua-mobile': '?1',
          'x-opera-timezone': '+08:00',
          origin: 'opera-aria://ui',
        }
      });

      const reply = response.data.message;

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const finalReply = `
🤖 𝗔𝗥𝗜𝗔 𝗔𝗜
━━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(finalReply), info.messageID);
      });

    } catch (err) {
      console.error("Aria error:", err);
      const errMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Something went wrong.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};