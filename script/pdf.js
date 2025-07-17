const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'pdfgen',
  version: '1.0.0',
  role: 0,
  aliases: ['pdfshift'],
  description: 'Convert a replied link into a PDF using PDFShift API',
  usage: '<reply to a URL>',
  credits: 'Jayy',
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;
  const repliedText = messageReply?.body?.trim();

  if (!/^https?:\/\//i.test(repliedText)) {
    return api.sendMessage(
      '❌ Please reply to a valid URL (starting with http:// or https://) to convert it to PDF.',
      threadID,
      messageID
    );
  }

  const apiKey = 'sk_7d8bd3f7e9394c644ac6ca16fda554d7c7ae032d';
  const outputPath = path.join(__dirname, `pdf_${Date.now()}.pdf`);

  api.sendMessage(
    '⌛ Generating PDF from the link, please wait...',
    threadID,
    async (err, info) => {
      if (err) return;

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
            source: repliedText,
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
          console.error('PDF write error:', err);
          api.editMessage('❌ Failed to save the PDF file.', info.messageID);
        });
      } catch (error) {
        console.error('❌ PDF generation failed:', error.response?.data || error.message);
        api.editMessage(
          '❌ Error occurred while generating PDF. Make sure the link is valid and public.',
          info.messageID
        );
      }
    }
  );
};