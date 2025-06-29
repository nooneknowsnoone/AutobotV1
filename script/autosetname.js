function checkShortCut(nickname, uid, userName) {
    return nickname
        .replace(/\{userName\}/gi, userName)
        .replace(/\{userID\}/gi, uid);
}

module.exports.config = {
    name: "autosetname",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Ry",
    description: "Auto-change nickname of new group members using a template",
    commandCategory: "group",
    usages: "autosetname [set <name> | on | off | view]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, threadsData }) {
    const { threadID, messageID } = event;
    const input = args[0];

    switch (input) {
        case "set":
        case "add":
        case "config": {
            if (args.length < 2)
                return api.sendMessage("⚠️ Please provide the nickname format.", threadID, messageID);

            const configAutoSetName = args.slice(1).join(" ");
            await threadsData.set(threadID, configAutoSetName, "data.autoSetName");
            return api.sendMessage("✅ Configuration set successfully.", threadID, messageID);
        }

        case "view":
        case "info": {
            const current = await threadsData.get(threadID, "data.autoSetName");
            if (!current) return api.sendMessage("ℹ️ No autoSetName configuration set yet.", threadID, messageID);
            return api.sendMessage(`📌 Current autoSetName config:\n${current}`, threadID, messageID);
        }

        case "on":
        case "off": {
            const isEnabled = input === "on";
            await threadsData.set(threadID, isEnabled, "settings.enableAutoSetName");
            return api.sendMessage(`✅ autoSetName feature has been turned ${isEnabled ? "on" : "off"}.`, threadID, messageID);
        }

        default:
            return api.sendMessage("❌ Invalid command. Use: set | view | on | off", threadID, messageID);
    }
};

// Handles new user joining the group
module.exports.handleEvent = async function ({ api, event, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const threadID = event.threadID;
    const isEnabled = await threadsData.get(threadID, "settings.enableAutoSetName");
    if (!isEnabled) return;

    const config = await threadsData.get(threadID, "data.autoSetName");
    if (!config) return;

    const newUsers = event.logMessageData.addedParticipants;

    for (const user of newUsers) {
        const { userFbId: uid, fullName } = user;
        const nickname = checkShortCut(config, uid, fullName);
        try {
            await api.changeNickname(nickname, threadID, uid);
        } catch (err) {
            console.error("❌ Failed to set nickname:", err.message);
            return api.sendMessage("⚠️ Error occurred while changing nickname. Try disabling invite links and retry.", threadID);
        }
    }
};