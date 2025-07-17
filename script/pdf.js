const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'pdfgen',
  version: '1.2.0',
  role: 0,
  aliases: ['pdfshift', 'img2pdf'],
  description: 'Convert replied URL or one/multiple images into a single PDF using PDFShift',
  usage: '<reply to a URL or image(s)>',
  credits: 'Jayy',
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply) {
    return api.sendMessage(
      '❌ Please reply to a message that contains a URL or image(s).',
      threadID,
      messageID
    );
  }

  const repliedText = messageReply?.body?.trim();
  const attachments = messageReply?.attachments || [];

  let htmlContent = '';
  let isValidSource = false;

  // If user replies with a URL (text)
  if (/^https?:\/\//i.test(repliedText)) {
    isValidSource = true;
    htmlContent = `<iframe src="${repliedText}" width="100%" height="100%"></iframe>`;
  }

  // If user replies with one or more images
  if (attachments.length > 0 && attachments.every(a => a.type === 'photo')) {
    isValidSource = true;
    htmlContent = attachments
      .map(img => `<img src="${img.url}" style="width:100%;margin-bottom:10px;">`)
      .join('');
  }

  if (!isValidSource) {
    return api.sendMessage(
      '❌ Please reply to a valid link or image(s). Supported types: http(s):// URL or photo.',
      threadID,
      messageID
    );
  }

  const apiKey = 'sk_7d8bd3f7e9394c644ac6ca16fda554d7c7ae032d';
  const outputPath = path.join(__dirname, `pdf_${Date.now()}.pdf`);

  api.sendMessage('⏳ Generating PDF, please wait...', threadID, async (err, info) => {
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
          html: htmlContent,
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
        console.error('❌ Error writing PDF:', err);
        api.editMessage('❌ Failed to save the PDF file.', info.messageID);
      });

    } catch (error) {
      console.error('❌ PDFShift API error:', error.response?.data || error.message);
      api.editMessage('❌ Error generating PDF. Please try again later.', info.messageID);
    }
  });
};