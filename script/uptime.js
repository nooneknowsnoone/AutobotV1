const os = require('os');
const pidusage = require('pidusage');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports.config = {
  name: "uptime",
  version: "1.0.2",
  role: 0,
  description: "System and bot status overview",
  hasPrefix: false,
  aliases: ["up", "stat"],
  cooldowns: 5
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    ++i;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

async function getDiskUsage() {
  try {
    const { stdout } = await exec('df -k /');
    const line = stdout.split('\n')[1];
    const parts = line.trim().split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    return { total, used };
  } catch (e) {
    return { total: 0, used: 0 };
  }
}

module.exports.run = async ({ api, event }) => {
  const usage = await pidusage(process.pid);
  const uptime = process.uptime();
  const systemUptime = os.uptime();
  const disk = await getDiskUsage();
  const totalMemory = os.totalmem();
  const usedMemory = totalMemory - os.freemem();

  const reply = 
`★ 𝗕𝗼𝘁 & 𝗦𝘆𝘀𝘁𝗲𝗺 𝗦𝘁𝗮𝘁𝘂𝘀 ★
━━━━━━━━━━━━━━━
🕒 Bot Uptime: ${formatUptime(uptime)}
⚙️ System Uptime: ${formatUptime(systemUptime)}
💾 RAM Usage: ${byte2mb(usedMemory)} / ${byte2mb(totalMemory)}
📊 Process RAM: ${byte2mb(usage.memory)}
🧠 CPU Usage: ${usage.cpu.toFixed(1)}%
💿 Disk Usage: ${byte2mb(disk.used)} / ${byte2mb(disk.total)}
🖥️ OS: ${os.type()} ${os.release()}
🔧 Arch: ${os.arch()} | Cores: ${os.cpus().length}
📈 Load Avg (1min): ${os.loadavg()[0].toFixed(2)}
📶 Ping: ${Date.now() - event.timestamp}ms`;

  return api.sendMessage(reply, event.threadID, event.messageID);
};