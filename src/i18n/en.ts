import type { Messages } from './messages';

export const en: Messages = {
  start: {
    greeting: [
      "Hi! I'll help you search for jobs matching your criteria.",
      '',
      '/settings — set job title, stack, countries and sources',
      '/mysettings — show current settings',
      '/search — search for new vacancies now',
      '/pause, /resume — pause or resume background search',
      '/clear — clear the history of shown vacancies',
      '/language — change bot language',
      '/help — help',
    ].join('\n'),
  },
  help: 'Use /settings to configure your search, then /search to find vacancies.',
  settings: {
    askTitle:
      'Enter job titles separated by commas — you can mix full titles and standalone keywords, the shorter and more specific a word is, the wider it searches (e.g. QA Engineer, Tester, Manual Tester, SDET, Automation). Avoid overly generic single words like "Engineer" or "Manager" on their own — they\'ll match jobs from completely unrelated fields:',
    askStack: 'Now enter your stack separated by commas (e.g. Node.js, TypeScript, PostgreSQL):',
    askExclude:
      'Words to exclude, comma-separated — vacancies containing them in the title or description won\'t be shown (optional, e.g. unpaid, internship, Senior). Send "-" to skip:',
    askCountries: 'Choose countries to search:',
    askSources: 'Choose job sources:',
    needAtLeastOneCountry: 'Choose at least one country',
    needAtLeastOneSource: 'Choose at least one source',
    notSetYet: "Settings aren't set yet. Type /settings to begin.",
    done: (summary) => `Done!\n\n${summary}\n\nUse /search to find vacancies now.`,
    labels: {
      jobTitle: 'Job title',
      stack: 'Stack',
      exclude: 'Exclude',
      excludeEmpty: '—',
      countries: 'Countries',
      sources: 'Sources',
      status: 'Status',
      paused: '⏸ paused (/resume)',
      active: '▶️ active (/pause)',
    },
  },
  search: {
    needSettings: 'Set up your search first: /settings',
    searching: 'Searching for vacancies...',
    noneFound: 'No new vacancies found.',
    sourceUnavailable: (names) => `⚠️ ${names}: source temporarily unavailable, try again later.`,
    truncated: (shown, total) =>
      `Showing ${shown} of ${total}. Run /search again to see more, or narrow your filters (/settings).`,
  },
  pause: {
    needSettings: 'Set up your search first: /settings',
    paused: 'Background search paused. /resume to continue.',
    resumed: 'Background search resumed.',
  },
  history: {
    cleared: (count) =>
      count > 0
        ? `Search history cleared (${count}). The next /search will show all vacancies matching your filters again, even ones you've already seen.`
        : 'Search history is already empty.',
  },
  feedback: {
    companyHidden: (company) => `Hid all vacancies from "${company}"`,
    skipped: 'Skipped',
  },
  vacancy: {
    viewLink: 'View',
    markApplied: '📨 Applied',
    appliedButton: '✅ Applied',
    appliedLabel: '✅ Already applied',
    appliedNoted: 'Marked as applied',
    skipButton: '⏭ Skip',
    blockButton: '🚫 Block company',
  },
  countries: {
    UA: '🇺🇦 Ukraine',
    PL: '🇵🇱 Poland',
    ES: '🇪🇸 Spain',
  },
  doneButton: 'Done ✔️',
  language: {
    prompt: 'Choose bot language:',
    changedTo: 'Language changed to English.',
  },
  commands: {
    start: 'Start using the bot',
    settings: 'Set job title, stack, countries, sources',
    mysettings: 'Show current settings',
    search: 'Search for vacancies now',
    pause: 'Pause background search',
    resume: 'Resume background search',
    language: 'Change bot language',
    clearhistory: 'Clear search history',
    help: 'Help',
  },
};
