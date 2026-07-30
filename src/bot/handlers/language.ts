import { Markup, type Telegraf } from 'telegraf';
import { setLocale } from '../../settings/localeStore';
import { t, getMessages } from '../../i18n';

export function registerLanguageHandlers(bot: Telegraf): void {
  bot.command('language', async (ctx) => {
    const messages = t(ctx);
    await ctx.reply(
      messages.language.prompt,
      Markup.inlineKeyboard([
        [Markup.button.callback('🇺🇦 Українська', 'lang:uk')],
        [Markup.button.callback('🇬🇧 English', 'lang:en')],
      ]),
    );
  });

  bot.action(/^lang:(uk|en)$/, async (ctx) => {
    const locale = ctx.match[1] as 'uk' | 'en';
    setLocale(String(ctx.from.id), locale);
    const messages = getMessages(locale);
    try {
      await ctx.editMessageText(messages.language.changedTo);
    } catch {
      // повідомлення вже змінено/видалено (подвійний клік) — ігноруємо
    }
    await ctx.answerCbQuery();
  });
}
