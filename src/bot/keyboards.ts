import { Markup } from 'telegraf';
import type { Messages } from '../i18n';

export function getCountries(t: Messages) {
  return [
    { value: 'UA', label: t.countries.UA },
    { value: 'PL', label: t.countries.PL },
    { value: 'ES', label: t.countries.ES },
  ];
}

// Назви джерел — власні назви, не потребують перекладу.
export const SOURCES = [
  { value: 'jooble', label: 'Jooble' },
  { value: 'adzuna', label: 'Adzuna (PL/ES)' },
];

export function toggleKeyboard(
  items: { value: string; label: string }[],
  selected: Set<string>,
  prefix: string,
  doneLabel: string,
) {
  const rows = items.map((item) => {
    const mark = selected.has(item.value) ? '✅ ' : '';
    return [Markup.button.callback(`${mark}${item.label}`, `${prefix}:${item.value}`)];
  });
  rows.push([Markup.button.callback(doneLabel, `${prefix}:done`)]);
  return Markup.inlineKeyboard(rows);
}
