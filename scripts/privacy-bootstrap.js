// Imported first by each page entry: select intro behavior from a valid choice.
(() => {
  const PREFERENCE_KEY = "idio-privacy-v1";
  const LEGACY_INTRO_KEY = "idio-home-loader-v1";
  const DAY = 24 * 60 * 60 * 1000;
  const LIFETIME = 180 * DAY;
  const canShowSettings = typeof HTMLDialogElement !== "undefined"
    && typeof HTMLDialogElement.prototype.showModal === "function";
  let preference = null;

  const removeLegacyIntro = () => {
    try { localStorage.removeItem(LEGACY_INTRO_KEY); } catch { /* Storage may be blocked. */ }
  };
  const isValid = (value) => value && value.version === 1
    && typeof value.intro === "boolean"
    && Number.isFinite(value.savedAt) && Number.isFinite(value.expiresAt)
    && value.savedAt <= Date.now() && value.savedAt > 0
    && value.expiresAt === value.savedAt + LIFETIME && value.expiresAt > Date.now();
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(PREFERENCE_KEY));
      if (isValid(value)) return value;
    } catch { /* Invalid or unavailable storage means optional use is off. */ }
    try { localStorage.removeItem(PREFERENCE_KEY); } catch { /* Storage may be blocked. */ }
    return null;
  };
  const allowed = () => canShowSettings && isValid(preference) === true && preference.intro;
  const notify = () => window.dispatchEvent(new CustomEvent("idio:privacy-change"));
  preference = read();
  // The preference alone selects the short intro; visit timestamps are retired.
  removeLegacyIntro();

  window.idioPrivacy = Object.freeze({
    getPreference: () => isValid(preference) ? { ...preference } : null,
    allowsIntro: allowed,
    save: (intro) => {
      const savedAt = Date.now();
      const next = { version: 1, intro: intro === true, savedAt, expiresAt: savedAt + LIFETIME };
      let persisted = false;
      try {
        localStorage.setItem(PREFERENCE_KEY, JSON.stringify(next));
        persisted = localStorage.getItem(PREFERENCE_KEY) === JSON.stringify(next);
      } catch { /* Failed persistence never enables optional storage. */ }
      if (!persisted) {
        try { localStorage.removeItem(PREFERENCE_KEY); } catch { /* Browser site-data controls may be needed. */ }
      }
      preference = persisted ? next : null;
      removeLegacyIntro();
      notify();
      return persisted;
    },
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== PREFERENCE_KEY && event.key !== null) return;
    preference = read();
    removeLegacyIntro();
    notify();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    preference = read();
    removeLegacyIntro();
    notify();
  });
})();
