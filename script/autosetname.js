const checkShortCut = (nickname, uid, userName) => {
  if (/{userName}/gi.test(nickname)) {
    nickname = nickname.replace(/{userName}/gi, userName);
  }
  if (/{userID}/gi.test(nickname)) {
    nickname = nickname.replace(/{userID}/gi, uid);
  }
  return nickname;
};

module.exports.config = {
  name: "autosetname",
  version: "1.3.0",
  role: 1,
  hasPrefix: false,
  aliases: [],
  description: "Auto set nickname for new members using shortcut templates",
  usage: "autosetname set <nickname> | on | off | view",
  credits: "Converted by you | Original by NTKhang",
  cooldown: 5,
  category: "box chat",
};

module.exports.run = async function ({ api, event, args, message, threadsData }) {
  const { threadID } = event;

  switch (args[0]) {
    case "set":
    case "add":
    case "config": {
      if (args.length < 2) {
        return message.reply("⚠️ Please enter the required configuration.");
      }
      const config = args.slice(1).join(" ");
      await threadsData.set(threadID, config, "data.autoSetName");
      return message.reply("✅ Nickname configuration saved successfully!");
    }

    case "view":
    case "info": {
      const config = await threadsData.get(threadID, "data.autoSetName");
      return message.reply(
        config
          ? `📌 Current autoSetName config:\n${config}`
          : "ℹ️ No autoSetName config found for this group."
      );
    }

    case "on":
    case "off": {
      const enable = args[0] === "on";
      await threadsData.set(threadID, enable, "settings.enableAutoSetName");
      return message.reply(
        enable
          ? "✅ Auto nickname setting is now ON."
          : "🚫 Auto nickname setting is now OFF."
      );
    }

    default:
      return message.reply(
        "⚠️ Invalid usage. Use: autosetname set <nickname>, view, on, or off"
      );
  }
};

// Listen to new user events and apply nickname
module.exports.onEvent = async function ({ event, api, threadsData, message }) {
  if (event.logMessageType !== "log:subscribe") return;

  const threadID = event.threadID;
  const isEnabled = await threadsData.get(threadID, "settings.enableAutoSetName");
  if (!isEnabled) return;

  const config = await threadsData.get(threadID, "data.autoSetName");
  if (!config) return;

  const addedParticipants = [...event.logMessageData.addedParticipants];

  for (const user of addedParticipants) {
    const { userFbId: uid, fullName: userName } = user;
    try {
      const finalName = checkShortCut(config, uid, userName);
      await api.changeNickname(finalName, threadID, uid);
    } catch (err) {
      return message.reply(
        "❌ Error occurred while auto-setting nickname. Try disabling invite link or try again later."
      );
    }
  }
};