// Synchronous: check consent before the homepage reads optional intro memory.
(() => {
  const PREFERENCE_KEY = "idio-privacy-v1";
  const INTRO_KEY = "idio-home-loader-v1";
  const DAY = 24 * 60 * 60 * 1000;
  const LIFETIME = 180 * DAY;
  let preference = null;

  const removeIntro = () => {
    try { localStorage.removeItem(INTRO_KEY); } catch { /* Storage may be blocked. */ }
    document.documentElement.classList.remove("home-loader-recent");
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
      localStorage.removeItem(PREFERENCE_KEY);
    } catch { /* Invalid or unavailable storage means optional use is off. */ }
    return null;
  };
  const allowed = () => {
    if (isValid(preference) && preference.intro) return true;
    removeIntro();
    return false;
  };
  const notify = () => window.dispatchEvent(new CustomEvent("idio:privacy-change"));
  preference = read();
  if (allowed()) {
    try {
      const lastShown = Number(localStorage.getItem(INTRO_KEY));
      const age = Date.now() - lastShown;
      if (lastShown > 0 && age >= 0 && age < 7 * DAY) {
        document.documentElement.classList.add("home-loader-recent");
      } else {
        removeIntro();
      }
    } catch { removeIntro(); }
  }

  window.idioPrivacy = Object.freeze({
    getPreference: () => isValid(preference) ? { ...preference } : null,
    allowsIntro: allowed,
    rememberIntro: () => {
      if (!allowed()) return;
      try { localStorage.setItem(INTRO_KEY, String(Date.now())); } catch { /* No fallback tracking. */ }
    },
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
      if (!allowed()) removeIntro();
      notify();
      return persisted;
    },
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== PREFERENCE_KEY && event.key !== null) return;
    preference = read();
    allowed();
    notify();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    preference = read();
    allowed();
    notify();
  });
})();
