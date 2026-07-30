import type { Messages } from './messages';

export const uk: Messages = {
  start: {
    greeting: [
      'Привіт! Я допоможу шукати вакансії за твоїми критеріями.',
      '',
      '/settings — задати посаду, стек, країни та джерела пошуку',
      '/mysettings — показати поточні налаштування',
      '/search — знайти нові вакансії зараз',
      '/language — змінити мову бота',
      '/help — довідка',
    ].join('\n'),
  },
  help: 'Використай /settings, щоб налаштувати пошук, а потім /search, щоб знайти вакансії.',
  settings: {
    askTitle:
      'Введи назви посади через кому — можна кілька синонімів, як їх називають у різних країнах/компаніях (наприклад: QA Engineer, Tester, SDET, Test Automation Engineer):',
    askStack: 'Тепер введи стек через кому (наприклад: Node.js, TypeScript, PostgreSQL):',
    askExclude:
      'Слова для виключення через кому — вакансії з ними в назві чи описі показані не будуть (необов\'язково, наприклад: unpaid, internship, Senior). Постав "-", щоб пропустити:',
    askCountries: 'Обери країни пошуку:',
    askSources: 'Обери джерела вакансій:',
    needAtLeastOneCountry: 'Обери хоча б одну країну',
    needAtLeastOneSource: 'Обери хоча б одне джерело',
    notSetYet: 'Налаштування ще не задано. Введи /settings, щоб почати.',
    done: (summary) => `Готово!\n\n${summary}\n\nВикористай /search, щоб знайти вакансії зараз.`,
    labels: {
      jobTitle: 'Посада',
      stack: 'Стек',
      exclude: 'Виключити',
      excludeEmpty: '—',
      countries: 'Країни',
      sources: 'Джерела',
      status: 'Статус',
      paused: '⏸ на паузі (/resume)',
      active: '▶️ активний (/pause)',
    },
  },
  search: {
    needSettings: 'Спочатку задай налаштування: /settings',
    searching: 'Шукаю вакансії...',
    noneFound: 'Нових вакансій не знайдено.',
    sourceUnavailable: (names) => `⚠️ ${names}: тимчасово недоступне джерело, спробуй пізніше.`,
    truncated: (shown, total) =>
      `Показано ${shown} з ${total}. Виконай /search ще раз, щоб побачити наступні, або звузь фільтри (/settings).`,
  },
  pause: {
    needSettings: 'Спочатку задай налаштування: /settings',
    paused: 'Фоновий пошук призупинено. /resume — щоб відновити.',
    resumed: 'Фоновий пошук відновлено.',
  },
  feedback: {
    companyHidden: (company) => `Приховано вакансії від "${company}"`,
    noted: 'Врахував, більше таких не покажу',
    liked: '👍',
  },
  vacancy: {
    viewLink: 'Переглянути',
  },
  countries: {
    UA: '🇺🇦 Україна',
    PL: '🇵🇱 Польща',
    ES: '🇪🇸 Іспанія',
  },
  doneButton: 'Готово ✔️',
  language: {
    prompt: 'Обери мову бота:',
    changedTo: 'Мову змінено на українську.',
  },
  commands: {
    start: 'Почати роботу з ботом',
    settings: 'Налаштувати посаду, стек, країни, джерела',
    mysettings: 'Показати поточні налаштування',
    search: 'Знайти вакансії зараз',
    pause: 'Призупинити фоновий пошук',
    resume: 'Відновити фоновий пошук',
    language: 'Змінити мову бота',
    help: 'Довідка',
  },
};
