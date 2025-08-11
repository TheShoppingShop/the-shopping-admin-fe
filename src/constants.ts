export const API_BASE = import.meta.env.VITE_APP_BASE_URL
export const APP_CREDENTIALS = {
  username: import.meta.env.VITE_APP_USERNAME,
  password: import.meta.env.VITE_APP_PASSWORD
} as const;
export const LOCALSTORAGE_SESSION_KEY = "app_session";
export const VIEW_PREFERENCE_KEY = "videos_view_mode";
