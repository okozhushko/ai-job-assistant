import { Markup } from 'telegraf';

export const COUNTRIES = [
  { value: 'UA', label: '🇺🇦 Україна' },
  { value: 'PL', label: '🇵🇱 Польща' },
  { value: 'ES', label: '🇪🇸 Іспанія' },
];

export const SOURCES = [
  { value: 'jooble', label: 'Jooble' },
  { value: 'adzuna', label: 'Adzuna (PL/ES)' },
];

export function toggleKeyboard(
  items: { value: string; label: string }[],
  selected: Set<string>,
  prefix: string,
) {
  const rows = items.map((item) => {
    const mark = selected.has(item.value) ? '✅ ' : '';
    return [Markup.button.callback(`${mark}${item.label}`, `${prefix}:${item.value}`)];
  });
  rows.push([Markup.button.callback('Готово ✔️', `${prefix}:done`)]);
  return Markup.inlineKeyboard(rows);
}
