const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "auto-advice",
  version: "2.1.2",
  credits: "Ry",
  description: "Sends advice if message is sent at scheduled time.",
};

const scheduledTimes = {
  "01:00:00 AM": true, "02:00:00 AM": true, "03:00:00 AM": true,
  "04:00:00 AM": true, "05:00:00 AM": true, "06:00:00 AM": true,
  "07:00:00 AM": true, "08:00:00 AM": true, "09:00:00 AM": true,
  "10:00:00 AM": true, "11:00:00 AM": true, "12:00:00 PM": true,
  "01:00:00 PM": true, "02:00:00 PM": true, "03:00:00 PM": true,
  "04:00:00 PM": true, "05:00:00 PM": true, "06:00:00 PM": true,
  "07:00:00 PM": true, "08:00:00 PM": true, "09:00:00 PM": true,
  "10:00:00 PM": true, "11:00:00 PM": true, "12:00:00 AM": true
};

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

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const now = moment().tz("Asia/Manila");
  const currentTime = now.format("hh:mm:ss A");

  if (!scheduledTimes[currentTime]) return;

  try {
    const res = await axios.get("https://wildan-suldyir-apis.vercel.app/api/advice");
    const advice = res.data?.advice || "Stay positive, keep growing.";

    const message = formatFont(
      `🔔 𝗔𝗨𝗧𝗢 𝗔𝗗𝗩𝗜𝗖𝗘\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ Time now - ${currentTime}\n\n💡 ${advice}`
    );

    api.sendMessage(message, event.threadID);
  } catch (err) {
    console.error("Failed to fetch/send advice:", err.message);
  }
};