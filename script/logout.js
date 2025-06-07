module.exports.config = {
    name: "logout",
    version: "1.0.1",
    role: 2,
    credits: "TIANN",
    description: "Logout ACC Bot",
    commandCategory: "System",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event })
{
api.sendMessage("✅ Bot has been lagout ...",event.threadID,event.messageID)
api.logout()
}