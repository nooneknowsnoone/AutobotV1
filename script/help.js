module.exports.run = async function ({ api, event, enableCommands, args, Utils, prefix }) {
  const input = args.join(' ').toLowerCase();
  const eventCommands = enableCommands[1].handleEvent;
  const commands = enableCommands[0].commands;
  const totalCommands = commands.length;
  const totalEvents = eventCommands.length;

  try {
    const pages = 25;
    let page = 1;

    // Show all commands if user types "all"
    if (input === 'all') {
      let helpMessage = `${formatFont('📃 All Commands')} (${totalCommands} total):\n\n`;
      for (let i = 0; i < totalCommands; i++) {
        helpMessage += `\t${i + 1}. 「 ${formatFont(prefix + commands[i])} 」\n`;
      }

      helpMessage += `\n${formatFont('📃 Event List')} (${totalEvents} total):\n\n`;
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t${index + 1}. 「 ${formatFont(prefix + eventCommand)} 」\n`;
      });

      helpMessage += `\nType '${prefix}help <command>' for command details.`;
      helpMessage += `\n\n🔗: chatbotcommunityltd-autobot.onrender.com/automated_fba`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    // Default paginated view if no input
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
      helpMessage += `\n\n🔗: chatbotcommunityltd-autobot.onrender.com/automated_fba`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    // If input is a page number
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
      helpMessage += `\n\n🔗: chatbotcommunityltd-autobot.onrender.com/automated_fba`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    // If input is a specific command
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