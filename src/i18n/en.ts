import type { Messages } from './messages';

export const en: Messages = {
  start: {
    greeting: [
      "Hi! I'll help you search for jobs matching your criteria.",
      '',
      '/settings — set job title, stack, countries and sources',
      '/mysettings — show current settings',
      '/search — search for new vacancies now',
      '/language — change bot language',
      '/help — help',
    ].join('\n'),
  },
  help: 'Use /settings to configure your search, then /search to find vacancies.',
  settings: {
    askTitle:
      "Enter job titles separated by commas — you can list several synonyms, as they're called in different countries/companies (e.g. QA Engineer, Tester, SDET, Test Automation Engineer):",
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
  feedback: {
    companyHidden: (company) => `Hid vacancies from "${company}"`,
    noted: "Got it, won't show more like this",
    liked: '👍',
  },
  vacancy: {
    viewLink: 'View',
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
    help: 'Help',
  },
};
