const globalData = global.zenLeaf = global.zenLeaf || {};

module.exports.config = {
  name: "chat",
  version: "1.0.0",
  role: 2, // Admin only
  hasPrefix: false,
  aliases: [],
  description: "Enable or disable group chat",
  usage: "chat on | chat off",
  credits: "Converted by you | Original by Mt",
  cooldown: 5,
  category: "box chat"
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (args.length === 0 || !["on", "off"].includes(args[0])) {
    return api.sendMessage(
      "❌ Invalid usage.\n📌 Usage: chat on | chat off",
      threadID,
      messageID
    );
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
  } catch (error) {
    console.error("Chat command error:", error.message);
    return api.sendMessage(
      `❌ An error occurred: ${error.message}`,
      threadID,
      messageID
    );
  }
};

// Optional: Middleware-like chat listener
module.exports.onChat = async function ({ api, event }) {
  const { threadID, senderID } = event;

  const isEnabled = globalData[threadID]?.chatEnabled ?? true;
  if (isEnabled) return;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const isSenderAdmin = adminIDs.includes(senderID);

    if (!isSenderAdmin) {
      await api.removeUserFromGroup(senderID, threadID);
      return api.sendMessage(
        "😼 CHAT DETECTED | The group is currently in 'chat off' mode. You have been kicked.",
        threadID
      );
    }
  } catch (error) {
    console.error("Chat listener error:", error.message);
  }
};