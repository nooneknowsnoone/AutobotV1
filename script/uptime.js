const os = require("os");

module.exports.config = {
  name: "uptime",
  version: "1.0.2",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Show bot uptime and system information.",
  usage: "uptime",
  credits: "Ry",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const uptimeSec = process.uptime();
  const days = Math.floor(uptimeSec / (60 * 60 * 24));
  const hours = Math.floor((uptimeSec % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((uptimeSec % (60 * 60)) / 60);
  const seconds = Math.floor(uptimeSec % 60);

  const userInfo = await api.getUserInfo(event.senderID);
  const userName = userInfo[event.senderID]?.name || "Unknown";

  const platform = os.platform();
  const arch = os.arch();
  const osVersion = os.version();
  const cpuModel = os.cpus()[0].model;
  const cpuCores = os.cpus().length;
  const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);

  const msg = 
`👤 𝗡𝗔𝗠𝗘: ${userName}
🏷️ 𝗜𝗗: ${event.senderID}
⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘: ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds

🖥️ | 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 |

💽 OS: ${osVersion} (${platform})
🧠 CPU: ${cpuModel}
🧩 Cores: ${cpuCores}
💾 Total Memory: ${totalMem} GB
📉 Free Memory: ${freeMem} GB`;

  api.sendMessage(msg, event.threadID, event.messageID);
};