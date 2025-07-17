const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'pdfgen',
  version: '1.1.0',
  role: 0,
  aliases: ['pdfshift', 'htmlpdf'],
  description: 'Convert a replied link or image into a PDF using PDFShift API',
  usage: '<reply to a URL or image>',
  credits: 'Jayy',
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  // Check if there's a reply
  if (!messageReply) {
    return api.sendMessage(
      '❌ Please reply to a message that contains a URL or an image.',
      threadID,
      messageID
    );
  }

  const repliedText = messageReply?.body?.trim();
  const attachment = messageReply?.attachments?.[0];
  let sourceURL = null;

  // Determine if it's a valid URL or image
  if (/^https?:\/\//i.test(repliedText)) {
    sourceURL = repliedText;
  } else if (attachment && attachment.type === 'photo' && attachment.url) {
    sourceURL = attachment.url;
  }

  if (!sourceURL) {
    return api.sendMessage(
      '❌ Replied message must contain a valid URL or an image.',
      threadID,
      messageID
    );
  }

  const apiKey = 'sk_7d8bd3f7e9394c644ac6ca16fda554d7c7ae032d';
  const outputPath = path.join(__dirname, `pdf_${Date.now()}.pdf`);

  api.sendMessage('⌛ Generating PDF from the replied content, please wait...', threadID, async (err, info) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.pdfshift.io/v3/convert/pdf',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        data: {
          source: sourceURL,
        },
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage(
          {
            body: '✅ PDF successfully generated!',
            attachment: fs.createReadStream(outputPath),
          },
          threadID,
          () => fs.unlinkSync(outputPath),
          messageID
        );
      });

      writer.on('error', err => {
        console.error('❌ PDF write error:', err);
        api.editMessage('❌ Failed to save the PDF file.', info.messageID);
      });
    } catch (error) {
      console.error('❌ PDF generation failed:', error.response?.data || error.message);
      api.editMessage('❌ Error generating PDF. Ensure the URL or image is accessible.', info.messageID);
    }
  });
};