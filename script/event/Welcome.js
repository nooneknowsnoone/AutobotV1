const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedUserId = event.logMessageData.addedParticipants[0]?.userFbId;
        const name = event.logMessageData.addedParticipants[0]?.fullName || "New Member";

        // Truncate long names for better card fitting
        const maxLength = 15;
        const shortName = name.length > maxLength ? name.slice(0, maxLength - 3) + '...' : name;

        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupName = groupInfo.threadName || "this group";
        const memberCount = groupInfo.participantIDs.length;
        const background = groupInfo.imageSrc || "https://i.imgur.com/TnU0KWm.jpeg";

        const apiURL = `https://api-rynx.onrender.com/api/welcome?username=${encodeURIComponent(shortName)}&avatarUrl=https://api-rynx.onrender.com/api/profile?uid=${addedUserId}&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}`;

        try {
            const { data } = await axios.get(apiURL, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `🎉 Welcome ${name} to ${groupName}!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (err) {
            console.error("Error generating welcome image:", err);
            api.sendMessage(`👋 Welcome ${name} to ${groupName}!`, event.threadID);
        }
    }
};