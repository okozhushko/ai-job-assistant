import path from 'node:path';
import { readJson, writeJson } from '../storage/jsonStore';
import type { UserSettings } from '../domain/types';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

type SettingsMap = Record<string, UserSettings>;

async function loadAll(): Promise<SettingsMap> {
  return readJson<SettingsMap>(SETTINGS_FILE, {});
}

async function saveAll(map: SettingsMap): Promise<void> {
  await writeJson(SETTINGS_FILE, map);
}

export async function getSettings(userId: string): Promise<UserSettings | undefined> {
  const all = await loadAll();
  return all[userId];
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const all = await loadAll();
  all[String(settings.telegramUserId)] = settings;
  await saveAll(all);
}

export async function getAllSettings(): Promise<UserSettings[]> {
  const all = await loadAll();
  return Object.values(all);
}
