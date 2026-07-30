export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

// Повторює запит лише на 429 (Too Many Requests) з експоненційною затримкою.
// Інші статуси (403, 404, 500...) не є тимчасовими — повторний запит
// того самого їх не виправить, тож там сенсу ретраїти немає.
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { retries = 2, baseDelayMs = 500 }: RetryOptions = {},
): Promise<Response> {
  let response: Response;
  for (let attempt = 0; attempt <= retries; attempt++) {
    response = await fetch(url, init);
    if (response.status !== 429 || attempt === retries) {
      return response;
    }
    await sleep(baseDelayMs * 2 ** attempt);
  }
  return response!;
}
