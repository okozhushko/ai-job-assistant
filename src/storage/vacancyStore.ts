import path from 'node:path';
import { readJson, writeJson } from './jsonStore';
import type { Vacancy } from '../domain/types';

const SEEN_FILE = path.join(process.cwd(), 'data', 'seen-vacancies.json');

type SeenMap = Record<string, string[]>;

async function loadSeen(): Promise<SeenMap> {
  return readJson<SeenMap>(SEEN_FILE, {});
}

async function saveSeen(map: SeenMap): Promise<void> {
  await writeJson(SEEN_FILE, map);
}

export async function filterNew(userId: string, vacancies: Vacancy[]): Promise<Vacancy[]> {
  const seen = await loadSeen();
  const seenIds = new Set(seen[userId] ?? []);
  return vacancies.filter((v) => !seenIds.has(v.id));
}

export async function markSeen(userId: string, vacancies: Vacancy[]): Promise<void> {
  if (vacancies.length === 0) return;
  const seen = await loadSeen();
  const existing = new Set(seen[userId] ?? []);
  for (const v of vacancies) existing.add(v.id);
  seen[userId] = Array.from(existing);
  await saveSeen(seen);
}
