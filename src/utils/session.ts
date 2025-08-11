import { LOCALSTORAGE_SESSION_KEY } from "@/constants";

export type AppSession = {
  username: string;
  loginAt: string; // ISO
};

export function getSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AppSession) {
  localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(LOCALSTORAGE_SESSION_KEY);
}

export function isAuthenticated() {
  return !!getSession();
}
