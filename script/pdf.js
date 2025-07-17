const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pdf",
  version: "1.0.0",
  role: 0,
  aliases: ["pdfshift", "htmltopdf"],
  description: "Convert a URL or HTML content into a PDF using PDFShift API",
  usage: "<url or HTML>",
  credits: "Jayy",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "❌ Please provide a URL or HTML content to convert to PDF.\n\nUsage: pdfgen <url>",
      threadID,
      messageID
    );
  }

  const input = args.join(" ");
  const isURL = /^https?:\/\//i.test(input);
  const apiKey = "sk_xxxxxxxxxxxx"; // replace with your real API key

  api.sendMessage("⏳ Converting to PDF, please wait...", threadID, async (err, info) => {
    try {
      const res = await axios.post(
        "https://api.pdfshift.io/v3/convert/",
        isURL ? { source: input } : { html: input },
        {
          responseType: "arraybuffer",
          auth: { username: apiKey, password: "" },
        }
      );

      const pdfPath = path.join(__dirname, "output.pdf");
      fs.writeFileSync(pdfPath, res.data);

      api.sendMessage(
        {
          body: "✅ PDF successfully generated!",
          attachment: fs.createReadStream(pdfPath),
        },
        threadID,
        () => fs.unlinkSync(pdfPath),
        messageID
      );
    } catch (err) {
      console.error("PDF generation failed:", err.response?.data || err.message);
      api.editMessage(
        "❌ Failed to generate PDF. Please check the input and try again.",
        info.messageID
      );
    }
  });
};