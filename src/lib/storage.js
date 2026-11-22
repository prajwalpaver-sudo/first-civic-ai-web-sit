const PREFIX = "js_";

export function readLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeLS(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — app still works */
  }
}

export const KEYS = {
  profile: "profile",
  saved: "saved",
  docs: "docs",
  chat: "chat",
};

export function getProfile() {
  return readLS(KEYS.profile, null);
}

export function saveProfile(profile) {
  writeLS(KEYS.profile, profile);
}

export function getSaved() {
  const list = readLS(KEYS.saved, []);
  return Array.isArray(list) ? list : [];
}

export function isSaved(id) {
  return getSaved().some((s) => s.id === id);
}

export function addSaved(item) {
  const list = getSaved().filter((s) => s.id !== item.id);
  list.unshift({ ...item, at: new Date().toISOString() });
  writeLS(KEYS.saved, list.slice(0, 60));
  return list;
}

export function removeSaved(id) {
  const list = getSaved().filter((s) => s.id !== id);
  writeLS(KEYS.saved, list);
  return list;
}

export function getDocs() {
  return readLS(KEYS.docs, {});
}

export function toggleDoc(name) {
  const docs = getDocs();
  const next = { ...docs, [name]: !docs[name] };
  writeLS(KEYS.docs, next);
  return next;
}

export function getChat() {
  const list = readLS(KEYS.chat, []);
  return Array.isArray(list) ? list : [];
}

export function saveChat(messages) {
  writeLS(KEYS.chat, messages.slice(-40));
}