const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "devpost",
  version: "1.5.0",
  role: 2, // Bot admins only
  hasPrefix: false,
  aliases: [],
  description: "This command is for Main Developer only.",
  usage: "you are not allowed men 🫵😼",
  credits: "Dev",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const messageReply = event.messageReply;
  const attachments = event.attachments || [];
  const postMessage = args.join(" ");
  const files = [];

  // ✅ Add your allowed UIDs here
  const allowedUIDs = ["61556437971771", "61556348043160"];

  if (!allowedUIDs.includes(event.senderID)) {
    return api.sendMessage(
      "❌ Bitch 🖕 You are not Ry.",
      threadID,
      messageID
    );
  }

  try {
    const allAttachments = messageReply?.attachments?.length
      ? messageReply.attachments
      : attachments;

    for (const attachment of allAttachments) {
      const filePath = path.join(__dirname, "cache", attachment.filename);

      const response = await axios({
        url: attachment.url,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      await fs.ensureDir(path.dirname(filePath));
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      files.push(fs.createReadStream(filePath));
    }

    const postData = { body: postMessage };
    if (files.length > 0) postData.attachment = files;

    api.createPost(postData)
      .then((url) => {
        api.sendMessage(
          `✅ Post created successfully!\n🔗 ${url || "No URL returned."}`,
          threadID,
          messageID
        );
      })
      .catch((error) => {
        const errorUrl = error?.data?.story_create?.story?.url;
        if (errorUrl) {
          return api.sendMessage(
            `✅ Post created successfully!\n🔗 ${errorUrl}\n⚠️ (Note: Post created with warnings)`,
            threadID,
            messageID
          );
        }

        let errorMessage = "❌ An unknown error occurred.";
        if (error?.errors?.length > 0) {
          errorMessage = error.errors.map(e => e.message).join("\n");
        } else if (error.message) {
          errorMessage = error.message;
        }

        api.sendMessage(`❌ Error creating post:\n${errorMessage}`, threadID, messageID);
      })
      .finally(() => {
        for (const file of files) {
          if (file.path) {
            fs.unlink(file.path).catch(err => {
              if (err) console.error("❌ File delete error:", err);
            });
          }
        }
      });

  } catch (err) {
    console.error("❌ Error processing post:", err);
    api.sendMessage("❌ An error occurred while creating the post.", threadID, messageID);
  }
};