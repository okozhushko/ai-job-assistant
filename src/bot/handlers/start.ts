import type { Telegraf } from 'telegraf';

export function registerStartHandlers(bot: Telegraf): void {
  bot.start(async (ctx) => {
    await ctx.reply(
      [
        'Привіт! Я допоможу шукати вакансії за твоїми критеріями.',
        '',
        '/settings — задати посаду, стек, країни та джерела пошуку',
        '/mysettings — показати поточні налаштування',
        '/search — знайти нові вакансії зараз',
        '/help — довідка',
      ].join('\n'),
    );
  });

  bot.help(async (ctx) => {
    await ctx.reply('Використай /settings, щоб налаштувати пошук, а потім /search, щоб знайти вакансії.');
  });
}
