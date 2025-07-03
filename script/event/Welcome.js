const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "welcome",
  version: "1.0.0"
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:subscribe") return;

  try {
    const addedParticipants = event.logMessageData.addedParticipants;
    const newMember = addedParticipants[0];
    const userID = newMember.userFbId;

    const userInfo = await api.getUserInfo(userID);
    let name = userInfo[userID]?.name || "User";

    if (name.length > 15) name = name.slice(0, 12) + "...";

    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "our group";
    const memberCount = threadInfo.participantIDs.length;

    const avatarUrl = `https://api-canvass.vercel.app/profile?uid=${userID}`;
    const background = threadInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

    // Build welcome image API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome` +
      `?username=${encodeURIComponent(name)}` +
      `&avatarUrl=${encodeURIComponent(avatarUrl)}` +
      `&groupname=${encodeURIComponent(groupName)}` +
      `&bg=${encodeURIComponent(background)}` +
      `&memberCount=${memberCount}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, "..", "cache", `welcome-${userID}.jpg`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, Buffer.from(response.data));

    await api.sendMessage({
      body: `👋 Welcome ${name} to ${groupName}! 🎉\nWe now have ${memberCount} members.`,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID);

    fs.unlinkSync(imgPath); // Cleanup

  } catch (error) {
    console.error("❌ Error in welcomenoti:", error.message || error);
    api.sendMessage("👋 A new member joined the group.", event.threadID);
  }
};