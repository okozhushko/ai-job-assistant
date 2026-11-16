export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Два повтори з паузами 500 мс і 1 с — достатньо, щоб переждати короткий
// сплеск rate-limit, і не затримує /search надовго, якщо ліміт тривалий.
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 500;

// Повторює запит лише на 429 (Too Many Requests) з експоненційною затримкою.
// Інші статуси (403, 404, 500...) не є тимчасовими — повторний запит
// того самого їх не виправить, тож там сенсу ретраїти немає.
export async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, init);
    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response;
    }
    await sleep(BASE_RETRY_DELAY_MS * 2 ** attempt);
  }
}
