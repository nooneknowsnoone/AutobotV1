const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        try {
            const addedParticipants = event.logMessageData.addedParticipants;
            const senderID = addedParticipants[0].userFbId;

            // Get user name
            let name = await api.getUserInfo(senderID).then(info => info[senderID].name);
            const maxLength = 15;
            if (name.length > maxLength) {
                name = name.substring(0, maxLength - 3) + '...';
            }

            // Get group info
            const groupInfo = await api.getThreadInfo(event.threadID);
            const groupName = groupInfo.threadName || "this group";
            const memberCount = groupInfo.participantIDs.length;
            const background = groupInfo.imageSrc || "https://i.imgur.com/TnU0KWm.jpeg";

            // Get avatar from API
            const avatarRes = await axios.get(`https://api-rynx.onrender.com/api/profile?uid=${senderID}`);
            const avatarUrl = avatarRes.data?.result || "https://i.imgur.com/TnU0KWm.jpeg";

            // Build welcome image URL
            const url = `https://api-rynx.onrender.com/api/welcome?username=${encodeURIComponent(name)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}`;

            // Fetch welcome image
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            // Send message with image
            api.sendMessage({
                body: `🎉 Everyone welcome the new member ${name} to ${groupName}! 🎉`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (error) {
            console.error("Error generating welcome image:", error);
            api.sendMessage({
                body: `🎉 Everyone welcome our new member to the group!`
            }, event.threadID);
        }
    }
};