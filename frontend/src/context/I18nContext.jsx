import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── Translations dictionary ───────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    brand: 'Bestiny',
    home: 'Home', search: 'Search', library: 'Your Library',
    settings: 'Settings', profile: 'Profile', upload: 'Upload Track',
    likedSongs: 'Liked Songs', createPlaylist: 'Create Playlist',
    signIn: 'Sign In', register: 'Register', signOut: 'Sign Out',
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    trending: 'Trending Now', fresh: 'Fresh Uploads', discover: 'Discover',
    noTracks: 'No tracks found', selectTrack: 'Select a track to start listening',
    notifications: 'Notifications', markAllRead: 'Mark all read',
    noNotifications: 'No new notifications',
    playlistName: 'Playlist name', description: 'Description', cancel: 'Cancel',
    create: 'Create', creating: 'Creating…',
    loginTitle: 'Sign in to continue listening',
    registerTitle: 'Create your free account',
    email: 'Email', password: 'Password', name: 'Full name',
    confirmPassword: 'Confirm password',
    guestModal: {
      title: 'Sign in to keep listening',
      body: 'Create a free account or sign in to like songs, build playlists, and more.',
      signIn: 'Sign In', register: 'Create account', later: 'Continue as guest',
    },
    installing: 'Install App',
  },
  ru: {
    brand: 'Bestiny',
    home: 'Главная', search: 'Поиск', library: 'Моя библиотека',
    settings: 'Настройки', profile: 'Профиль', upload: 'Загрузить трек',
    likedSongs: 'Любимые песни', createPlaylist: 'Создать плейлист',
    signIn: 'Войти', register: 'Регистрация', signOut: 'Выйти',
    goodMorning: 'Доброе утро', goodAfternoon: 'Добрый день',
    goodEvening: 'Добрый вечер',
    trending: 'В тренде', fresh: 'Новые треки', discover: 'Открытия',
    noTracks: 'Треки не найдены', selectTrack: 'Выберите трек для воспроизведения',
    notifications: 'Уведомления', markAllRead: 'Отметить все',
    noNotifications: 'Нет новых уведомлений',
    playlistName: 'Название плейлиста', description: 'Описание', cancel: 'Отмена',
    create: 'Создать', creating: 'Создаём…',
    loginTitle: 'Войдите, чтобы слушать',
    registerTitle: 'Создайте бесплатный аккаунт',
    email: 'Email', password: 'Пароль', name: 'Имя',
    confirmPassword: 'Подтвердите пароль',
    guestModal: {
      title: 'Войдите, чтобы продолжить слушать',
      body: 'Создайте аккаунт или войдите, чтобы ставить лайки, создавать плейлисты и многое другое.',
      signIn: 'Войти', register: 'Создать аккаунт', later: 'Позже',
    },
    installing: 'Установить приложение',
  },
  de: {
    brand: 'Bestiny',
    home: 'Startseite', search: 'Suche', library: 'Bibliothek',
    settings: 'Einstellungen', profile: 'Profil', upload: 'Track hochladen',
    likedSongs: 'Gefällt mir', createPlaylist: 'Playlist erstellen',
    signIn: 'Anmelden', register: 'Registrieren', signOut: 'Abmelden',
    goodMorning: 'Guten Morgen', goodAfternoon: 'Guten Tag',
    goodEvening: 'Guten Abend',
    trending: 'Im Trend', fresh: 'Neue Uploads', discover: 'Entdecken',
    noTracks: 'Keine Titel gefunden', selectTrack: 'Titel auswählen',
    notifications: 'Benachrichtigungen', markAllRead: 'Alle gelesen',
    noNotifications: 'Keine neuen Benachrichtigungen',
    playlistName: 'Playlist-Name', description: 'Beschreibung', cancel: 'Abbrechen',
    create: 'Erstellen', creating: 'Erstelle…',
    loginTitle: 'Anmelden um weiterzuhören',
    registerTitle: 'Kostenloses Konto erstellen',
    email: 'E-Mail', password: 'Passwort', name: 'Vollständiger Name',
    confirmPassword: 'Passwort bestätigen',
    guestModal: {
      title: 'Anmelden um weiterzuhören',
      body: 'Erstelle ein kostenloses Konto, um Songs zu liken und Playlists zu erstellen.',
      signIn: 'Anmelden', register: 'Konto erstellen', later: 'Später',
    },
    installing: 'App installieren',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => localStorage.getItem('bs_locale') ?? 'en');

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((lang) => {
    if (TRANSLATIONS[lang]) {
      setLocaleState(lang);
      localStorage.setItem('bs_locale', lang);
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback((key) => {
    const parts = key.split('.');
    let value = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
    for (const p of parts) {
      value = value?.[p];
    }
    return value ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
