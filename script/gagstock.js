const axios = require('axios');

module.exports.config = {
  name: "gagstock",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Jer",
  description: "Track Grow A Garden stock updates and weather",
  commandCategory: "utility",
  usages: "gagstock on/off",
  cooldowns: 5
};

const intervalMap = new Map();
const lastUpdateMap = new Map();

function getRestockCountdown(hour, minute) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = Math.floor((target - now) / 60000);
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function formatWeather(weather) {
  return `🌤️ Weather Today: ${weather?.weather_today || 'Unknown'}\n🌦️ Weather Tomorrow: ${weather?.weather_tomorrow || 'Unknown'}`;
}

function formatStockData(data) {
  return [
    `🌱 Seed: ${data?.seed?.stock || 0}`,
    `🥚 Egg: ${data?.egg?.stock || 0}`,
    `🍯 Honey: ${data?.honey?.stock || 0}`,
    `💄 Cosmetics: ${data?.cosmetics?.stock || 0}`,
    `🛠 Gear Restocks in: ${getRestockCountdown(0, 0)}`,
    `🌾 Seed Restocks in: ${getRestockCountdown(3, 0)}`,
    `🥚 Egg Restocks in: ${getRestockCountdown(6, 0)}`,
    `🍯 Honey Restocks in: ${getRestockCountdown(6, 0)}`,
    `💄 Cosmetics Restocks in: ${getRestockCountdown(21, 0)}`
  ].join('\n');
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID } = event;
  const command = args[0];

  if (command === "off") {
    if (intervalMap.has(senderID)) {
      clearInterval(intervalMap.get(senderID));
      intervalMap.delete(senderID);
      return api.sendMessage("❌ GAG stock tracking disabled.", threadID);
    } else {
      return api.sendMessage("⚠️ No active tracking session found.", threadID);
    }
  }

  if (intervalMap.has(senderID)) {
    return api.sendMessage("🔄 You already have an active tracking session. Use 'gagstock off' to stop it.", threadID);
  }

  const fetchAndSend = async () => {
    try {
      const [stockRes, weatherRes] = await Promise.all([
        axios.get("http://65.108.103.151:22377/api/stocks?type=all"),
        axios.get("https://growagardenstock.com/api/stock/weather")
      ]);

      const stockData = stockRes.data;
      const weatherData = weatherRes.data;
      const combinedKey = JSON.stringify({ ...stockData, ...weatherData });

      if (lastUpdateMap.get(senderID) !== combinedKey) {
        const message = `📦 GAG STOCK UPDATE 📦\n\n${formatStockData(stockData)}\n\n${formatWeather(weatherData)}`;
        api.sendMessage(message, threadID);
        lastUpdateMap.set(senderID, combinedKey);
      }
    } catch (err) {
      console.error("Error fetching GAG stock:", err.message);
    }
  };

  await fetchAndSend(); // Initial call

  const interval = setInterval(fetchAndSend, 60000); // every 60 seconds
  intervalMap.set(senderID, interval);

  return api.sendMessage("✅ GAG stock tracking enabled. Updates every 60 seconds.\nUse 'gagstock off' to disable.", threadID);
};