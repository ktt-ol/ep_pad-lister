'use strict';

(async () => {
  // Only use languages for which this plugin provides translations.
  // Other languages fall back to the English text in the HTML template.
  const supportedLanguages = new Set([
    'de', 'en', 'es', 'fr', 'it',
    'nl', 'pl', 'pt-br', 'tr', 'uk',
  ]);

  // Etherpad stores the selected language in a cookie.
  // The cookie name may have a configurable prefix.
  const cookiePrefix = window.clientVars?.cookiePrefix || '';
  const cookieName = `${cookiePrefix}language`;

  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  const languageCookie = cookies.find((cookie) =>
    cookie.startsWith(`${cookieName}=`));

  const cookieLanguage = languageCookie
    ? decodeURIComponent(languageCookie.slice(cookieName.length + 1))
    : null;

  // Prefer the language explicitly selected in Etherpad.
  // Otherwise, try the browser's preferred languages and finally English.
  const preferredLanguages = [
    cookieLanguage,
    ...(navigator.languages || [navigator.language]),
    'en',
  ];

  // Normalize language codes and also try their base language.
  // For example, "de-DE" becomes "de-de" and "de",
  // while "pt-BR" matches the plugin's "pt-br" translation.
  const candidates = [];

  for (const preferred of preferredLanguages) {
    if (!preferred) continue;

    const normalized = preferred.toLowerCase();
    candidates.push(normalized);

    if (normalized.includes('-')) {
      candidates.push(normalized.split('-')[0]);
    }
  }

  try {
    // Etherpad provides an index of available translations.
    // Entries can contain a URL to a locale file or inline translations.
    const response = await fetch('/locales.json');
    if (!response.ok) throw new Error('Unable to load locale index');

    const index = await response.json();

    // Find the first preferred language supported by both Etherpad
    // and this plugin.
    for (const language of candidates) {
      if (!supportedLanguages.has(language)) continue;
      if (!Object.prototype.hasOwnProperty.call(index, language)) continue;

      const entry = index[language];
      let translations;

      // Most languages are stored in separate JSON files.
      // English translations are typically embedded in the locale index.
      if (typeof entry === 'string') {
        const localeResponse = await fetch(
          new URL(entry, window.location.origin + '/')
        );

        if (!localeResponse.ok) {
          throw new Error(`Unable to load translations for ${language}`);
        }

        translations = await localeResponse.json();
      } else {
        translations = entry;
      }

      // Locale files contain a language wrapper, e.g. {"de": {...}},
      // while inline translations are usually flat objects.
      const strings = translations[language] || translations;

      // Replace the English fallback text in elements with data-l10n-id.
      // textContent is used deliberately to avoid interpreting
      // translated strings as HTML.
      document.querySelectorAll('[data-l10n-id]').forEach((element) => {
        const key = element.getAttribute('data-l10n-id');

        if (Object.prototype.hasOwnProperty.call(strings, key)) {
          element.textContent = strings[key];
        }
      });

      // Inform the browser and assistive technologies about the language.
      document.documentElement.lang = language;
      return;
    }
  } catch (error) {
    // If localization fails, keep the English text from the template.
    console.warn('ep_pad-lister: localization failed', error);
  }
})();

