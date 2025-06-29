const fs = require("fs-extra");
const globalData = global.zenLeaf = global.zenLeaf || {};

module.exports.config = {
  name: "chat",
  version: "1.0.0",
  role: 2,
  credits: "Ry",
  description: "Enable or disable group chat",
  usages: "chat on | chat off",
  hasPrefix: false,
  cooldown: 5,
  info: [
    {
      key: "on",
      prompt: "Enables group chat for all members",
      type: "",
      example: "chat on"
    },
    {
      key: "off",
      prompt: "Restricts chat to admins only, non-admins will be kicked",
      type: "",
      example: "chat off"
    }
  ]
};

module.exports.run = async function({ api, args, event, utils }) {
  const { threadID, messageID, senderID } = event;

  if (!args[0] || !["on", "off"].includes(args[0])) {
    return api.sendMessage("❌ Invalid usage.\n📌 Usage: chat on | chat off", threadID, messageID);
  }

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const isSenderAdmin = adminIDs.includes(senderID);

    if (!isSenderAdmin) {
      return api.sendMessage("⚠️ You do not have permission to use this command!", threadID, messageID);
    }

    globalData[threadID] = globalData[threadID] || {};

    if (args[0] === "on") {
      globalData[threadID].chatEnabled = true;
      return api.sendMessage("✅ Chat restriction removed. Members can now chat freely.", threadID, messageID);
    } else {
      globalData[threadID].chatEnabled = false;
      return api.sendMessage("🚫 Chat has been restricted. Non-admins will be kicked if they chat.", threadID, messageID);
    }
  } catch (err) {
    console.error("Chat command error:", err);
    return api.sendMessage(`❌ An error occurred: ${err.message}`, threadID, messageID);
  }
};

module.exports.onChat = async function({ api, event }) {
  const { threadID, senderID } = event;

  const isEnabled = globalData[threadID]?.chatEnabled ?? true;
  if (isEnabled) return;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const isSenderAdmin = adminIDs.includes(senderID);

    if (!isSenderAdmin) {
      await api.removeUserFromGroup(senderID, threadID);
      return api.sendMessage("😼 CHAT DETECTED | The group is currently in 'chat off' mode. You have been kicked.", threadID);
    }
  } catch (err) {
    console.error("Chat listener error:", err.message);
  }
};
