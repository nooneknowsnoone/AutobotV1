const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "tikstalk",
    version: "1.0.0",
    role: 0,
    credits: "dev",
    description: "Get TikTok user stats by username.",
    hasPrefix: false,
    aliases: ["ttstalk", "ttinfo"],
    usage: "[tikstalk <username>]",
    cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const username = args[0];

    if (!username) {
        return api.sendMessage("❌ Usage: tikstalk <username>\nExample: tikstalk charlidamelio", threadID, messageID);
    }

    api.sendMessage("🔎 Fetching TikTok profile data...", threadID);

    try {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/tikstalk?username=${encodeURIComponent(username)}&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.username) {
            return api.sendMessage("❌ TikTok profile not found.", threadID, messageID);
        }

        const {
            nickname,
            username: displayUsername,
            avatarLarger,
            followerCount,
            followingCount,
            heartCount,
            videoCount,
            signature
        } = data;

        const profileText =
`👤 Name: ${nickname}
📛 Username: ${displayUsername}
📝 Bio: ${signature || "No bio"}
🎥 Videos: ${videoCount}
❤️ Likes: ${heartCount}
👥 Followers: ${followerCount}
➡️ Following: ${followingCount}`;

        await api.sendMessage(profileText, threadID);

        const imagePath = path.join(__dirname, `tiktok_${Date.now()}.jpg`);
        const imageResponse = await axios({
            url: avatarLarger,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        imageResponse.data.pipe(writer);

        writer.on("finish", async () => {
            await api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID);
            fs.unlinkSync(imagePath);
        });

        writer.on("error", err => {
            console.error("Write stream error:", err);
            api.sendMessage("⚠️ Error saving TikTok avatar image.", threadID);
        });

    } catch (error) {
        console.error("TikStalk Command Error:", error.message);
        api.sendMessage("❌ Error fetching TikTok data.", threadID);
    }
};