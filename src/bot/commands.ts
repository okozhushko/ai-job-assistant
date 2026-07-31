import type { Messages } from '../i18n';

export function buildCommands(t: Messages) {
  return [
    { command: 'start', description: t.commands.start },
    { command: 'settings', description: t.commands.settings },
    { command: 'mysettings', description: t.commands.mysettings },
    { command: 'search', description: t.commands.search },
    { command: 'pause', description: t.commands.pause },
    { command: 'resume', description: t.commands.resume },
    { command: 'language', description: t.commands.language },
    { command: 'clear', description: t.commands.clearhistory },
    { command: 'help', description: t.commands.help },
  ];
}
