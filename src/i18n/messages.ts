export type Locale = 'uk' | 'en';

export interface Messages {
  start: {
    greeting: string;
  };
  help: string;
  settings: {
    askTitle: string;
    askStack: string;
    askExclude: string;
    askCountries: string;
    askSources: string;
    needAtLeastOneCountry: string;
    needAtLeastOneSource: string;
    notSetYet: string;
    done: (summary: string) => string;
    labels: {
      jobTitle: string;
      stack: string;
      exclude: string;
      excludeEmpty: string;
      countries: string;
      sources: string;
      status: string;
      paused: string;
      active: string;
    };
  };
  search: {
    needSettings: string;
    searching: string;
    noneFound: string;
    sourceUnavailable: (names: string) => string;
    truncated: (shown: number, total: number) => string;
  };
  pause: {
    needSettings: string;
    paused: string;
    resumed: string;
  };
  feedback: {
    companyHidden: (company: string) => string;
    noted: string;
    liked: string;
  };
  vacancy: {
    viewLink: string;
  };
  countries: {
    UA: string;
    PL: string;
    ES: string;
  };
  doneButton: string;
  language: {
    prompt: string;
    changedTo: string;
  };
  commands: {
    start: string;
    settings: string;
    mysettings: string;
    search: string;
    pause: string;
    resume: string;
    language: string;
    help: string;
  };
}
