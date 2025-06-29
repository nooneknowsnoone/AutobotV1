const globalData = global.zenLeaf = global.zenLeaf || {};

module.exports.config = {
  name: "chat",
  version: "1.0.0",
  role: 1, // Admin only
  hasPrefix: false,
  aliases: [],
  description: "Enable or disable group chat",
  usage: "chat on | chat off",
  credits: "Converted by you | Original by Mt",
  cooldown: 5,
  category: "box chat"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const isAdmin = event.isGroup && event.senderID === event.threadID ? true : false;

  if (args.length === 0 || !["on", "off"].includes(args[0])) {
    return api.sendMessage(
      "❌ Invalid usage.\n📌 Usage: chat on | chat off",
      threadID,
      messageID
    );
  }

  if (event.senderID !== senderID || event.isGroup && !isAdmin) {
    return api.sendMessage("⚠️ You do not have permission to use this command!", threadID, messageID);
  }

  globalData[threadID] = globalData[threadID] || {};

  if (args[0] === "on") {
    globalData[threadID].chatEnabled = true;
    return api.sendMessage("✅ Chat restriction removed. Members can now chat freely.", threadID, messageID);
  } else if (args[0] === "off") {
    globalData[threadID].chatEnabled = false;
    return api.sendMessage("🚫 Chat has been restricted. Non-admins will be kicked if they chat.", threadID, messageID);
  }
};

// Middleware-like listener for incoming messages
module.exports.onChat = async function ({ api, event }) {
  const { threadID, senderID } = event;

  const isEnabled = globalData[threadID]?.chatEnabled ?? true;

  if (!isEnabled) {
    // Simulate role check: if not admin, remove user
    api.getThreadInfo(threadID, (err, info) => {
      if (err || !info) return;

      const adminIDs = info.adminIDs.map(item => item.id);
      const isSenderAdmin = adminIDs.includes(senderID);

      if (!isSenderAdmin) {
        api.removeUserFromGroup(senderID, threadID, (err) => {
          if (err) return console.error("❌ Failed to kick user:", err);
        });

        return api.sendMessage(
          "😼 CHAT DETECTED | The group is currently in 'chat off' mode. You have been kicked.",
          threadID
        );
      }
    });
  }
};