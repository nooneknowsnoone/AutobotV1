const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        // Truncate name if it's too long
        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupName = groupInfo.threadName || "this group";

        const imageUrl = "https://i.imgur.com/7oPQNZg.gif";
        const filePath = path.join(__dirname, "cache", "welcome.gif");

        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: `👋 Welcome ${name} to ${groupName}! 🎉`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("❌ Error fetching static welcome image:", error);
            api.sendMessage({
                body: `👋 Welcome ${name} to ${groupName}!`
            }, event.threadID);
        }
    }
};