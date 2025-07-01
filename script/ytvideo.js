const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "video",
  aliases: ["ytvideo"],
  version: "1.0.1",
  role: 0,
  description: "Search and download YouTube videos.",
  credits: "Ry",
  cooldown: 10,
};

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join("");
}

module.exports.run = async function({ api, event, args }) {
  try {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(formatFont("Usage: video <search query>"), event.threadID, (err, info) => {
        setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, event.messageID);
    }

    const notice = await api.sendMessage(formatFont("⏳ | Searching, please wait..."), event.threadID, null, event.messageID);

    const res = await axios.get(`https://kaiz-apis.gleeze.com/api/video`, {
      params: {
        query,
        apikey: "bbcc44b9-4710-41c7-8034-fa2000ea7ae5"
      }
    });

    const data = res.data;
    if (!data || !data.download_url) {
      return api.sendMessage(formatFont("❌ No video found or failed to get video."), event.threadID);
    }

    const message = `🎞️ 𝗧𝗶𝘁𝗹𝗲: ${data.title}\n🕒 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${data.duration}\n🎬 𝗔𝘂𝘁𝗵𝗼𝗿: ${data.author}`;

    const filePath = path.join(__dirname, "/cache/video.mp4");
    const writer = fs.createWriteStream(filePath);

    const videoStream = await axios({
      method: "GET",
      url: data.download_url,
      responseType: "stream"
    });

    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: formatFont(message),
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));
    });

    writer.on("error", err => {
      console.error("Write error:", err);
      api.sendMessage(formatFont("⚠️ Error downloading video."), event.threadID);
    });

  } catch (err) {
    console.error("Request failed:", err);
    api.sendMessage(formatFont("❗ Error processing the request."), event.threadID);
  }
};