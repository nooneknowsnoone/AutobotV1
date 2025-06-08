const axios = require('axios');
const cr = require('crypto');

function agent() {
  const chromeVersion = `${Math.floor(Math.random() * 6) + 130}.0.0.0`;
  const oprVersion = `${Math.floor(Math.random() * 5) + 86}.0.0.0`;
  return `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36 OPR/${oprVersion}`;
}

module.exports.config = {
  name: "aria",
  version: "1.0.0",
  credits: "dev (rest api)",
  description: "Ask Opera Aria AI anything.",
  usage: "aria <question>",
  cooldown: 3,
  role: 0,
  hasPrefix: false,
  aliases: [],
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(' ');
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage("❗ Please provide a question.", threadID, messageID);
  }

  try {
    api.sendMessage("🧠 Aria AI is thinking...", threadID, messageID);

    const tokenRequest = new URLSearchParams({
      client_id: 'ofa',
      grant_type: 'refresh_token',
      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5ODY3MTgyMTgiLCJjaWQiOiJvZmEiLCJ2ZXIiOiIyIiwiaWF0IjoxNzM1NTQ0MzAzLCJqdGkiOiJiOGRoV0Z4TTc3MTczNTU0NDMwMyJ9.EAJrJflcetOzXUdCfQve306QTe_h3Zac76XxjS5Xg1c',
      scope: 'shodan:aria user:read'
    }).toString();

    const tokenRes = await axios.post('https://oauth2.opera-api.com/oauth2/v1/token/', tokenRequest, {
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

    if (reply.trim()) {
      return api.sendMessage(reply.trim(), threadID, messageID);
    } else {
      return api.sendMessage("⚠️ You've reached your daily request limit. Please try again tomorrow.", threadID, messageID);
    }
  } catch (err) {
    console.error("Aria error:", err.message);
    return api.sendMessage("❌ Error: " + err.message, threadID, messageID);
  }
};