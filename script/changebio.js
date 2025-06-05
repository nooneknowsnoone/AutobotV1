module.exports.config = {
    name: "changebio",
    version: "1.7",
    role: 2, // admin level permission
    description: "Change the bot's bio text",
    prefix: false,
    premium: false,
    credits: "Arn",
    cooldowns: 5,
    category: "admin"
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const newBio = args.join(" ").trim();

    if (!newBio) {
        return api.sendMessage(
            "Provide text",
            threadID,
            messageID
        );
    }

    try {
        await api.changeBio(newBio);

        // Double-check by sending the confirmation separately
        return api.sendMessage(
            `✅ Bot bio successfully changed to:\n📝 "${newBio}"`,
            threadID,
            messageID
        );
    } catch (error) {
        console.error("❌ Failed to change bot bio:", error);
        return api.sendMessage(
            "❌ Failed to change bot bio. Please check the logs for details.",
            threadID,
            messageID
        );
    }
};