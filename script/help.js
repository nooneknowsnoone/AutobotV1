const fontEnabled = true;

function formatFont(text) {
  const fontMap = {
    a: '𝖺', b: '𝖻', c: '𝖼', d: '𝖽', e: '𝖾', f: '𝖿', g: '𝗀', h: '𝗁', i: '𝗂', j: '𝗃', k: '𝗄', l: '𝗅', m: '𝗆',
    n: '𝗇', o: '𝗈', p: '𝗉', q: '𝗊', r: '𝗋', s: '𝗌', t: '𝗍', u: '𝗎', v: '𝗏', w: '𝗐', x: '𝗑', y: '𝗒', z: '𝗓',
    A: '𝖠', B: '𝖡', C: '𝖢', D: '𝖣', E: '𝖤', F: '𝖥', G: '𝖦', H: '𝖧', I: '𝖨', J: '𝖩', K: '𝖪', L: '𝖫', M: '𝖬',
    N: '𝖭', O: '𝖮', P: '𝖯', Q: '𝖰', R: '𝖱', S: '𝖲', T: '𝖳', U: '𝖴', V: '𝖵', W: '𝖶', X: '𝖷', Y: '𝖸', Z: '𝖹'
  };
  return [...text].map(c => fontEnabled && fontMap[c] ? fontMap[c] : c).join('');
}

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['tulong'],
  description: "Beginner's guide",
  usage: "help [page] or [command]",
  credits: 'Developer',
};

module.exports.run = async function ({ api, event, enableCommands, args, Utils, prefix }) {
  const input = args.join(' ');
  const eventCommands = enableCommands[1].handleEvent;
  const commands = enableCommands[0].commands;
  const totalCommands = commands.length;
  const totalEvents = eventCommands.length;

  try {
    const pages = 25;
    let page = 1;

    if (!input) {
      const start = (page - 1) * pages;
      const end = start + pages;
      let helpMessage = `${formatFont('📃 Command List')} (${totalCommands} total):\n\n`;

      for (let i = start; i < Math.min(end, totalCommands); i++) {
        helpMessage += `\t${i + 1}. 「 ${formatFont(prefix + commands[i])} 」\n`;
      }

      helpMessage += `\n${formatFont('📃 Event List')} (${totalEvents} total):\n\n`;
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t${index + 1}. 「 ${formatFont(prefix + eventCommand)} 」\n`;
      });

      helpMessage += `\n${formatFont(`Page ${page}/${Math.ceil(totalCommands / pages)}`)}.`;
      helpMessage += `\nType '${prefix}help <page>' to view more.`;
      helpMessage += `\nType '${prefix}help <command>' for command details.`;
      helpMessage += `\n\n🛠️ Created by: autobot404.onrender.com`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    if (!isNaN(input)) {
      page = parseInt(input);
      const start = (page - 1) * pages;
      const end = start + pages;
      let helpMessage = `${formatFont('📃 Command List')} (${totalCommands} total):\n\n`;

      for (let i = start; i < Math.min(end, totalCommands); i++) {
        helpMessage += `\t${i + 1}. 「 ${formatFont(prefix + commands[i])} 」\n`;
      }

      helpMessage += `\n${formatFont('📃 Event List')} (${totalEvents} total):\n\n`;
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t${index + 1}. 「 ${formatFont(prefix + eventCommand)} 」\n`;
      });

      helpMessage += `\n${formatFont(`Page ${page}/${Math.ceil(totalCommands / pages)}`)}.`;
      helpMessage += `\nType '${prefix}help <page>' to view more.`;
      helpMessage += `\nType '${prefix}help <command>' for command details.`;
      helpMessage += `\n\n🛠️ Created by: autobot404.onrender.com`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) =>
      key.includes(input.toLowerCase())
    )?.[1];

    if (command) {
      const {
        name, version, role, aliases = [], description, usage,
        credits, cooldown, hasPrefix
      } = command;

      const roleMessage = role !== undefined
        ? (role === 0 ? '➛ Permission: user' :
          role === 1 ? '➛ Permission: admin' :
            role === 2 ? '➛ Permission: thread Admin' :
              role === 3 ? '➛ Permission: super Admin' : '')
        : '';

      const details = ` 「 Command Info 」
➛ Name: ${name}
➛ Version: ${version || 'N/A'}
${roleMessage}
${aliases.length ? `➛ Aliases: ${aliases.join(', ')}` : ''}
${description ? `➛ Description: ${description}` : ''}
${usage ? `➛ Usage: ${usage}` : ''}
${credits ? `➛ Credits: ${credits}` : ''}
${cooldown ? `➛ Cooldown: ${cooldown}s` : ''}`.trim();

      return api.sendMessage(formatFont(details), event.threadID, event.messageID);
    }

    return api.sendMessage(formatFont('❌ Command not found.'), event.threadID, event.messageID);
  } catch (error) {
    console.error("Help Command Error:", error);
    return api.sendMessage("❌ An error occurred while loading help.", event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, prefix }) {
  const { threadID, messageID, body } = event;
  if (body?.toLowerCase().startsWith('prefix')) {
    const message = prefix ? `This is my prefix: ${prefix}` : "Sorry, I don't have a prefix.";
    return api.sendMessage(formatFont(message), threadID, messageID);
  }
};