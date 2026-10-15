export const initPrivacyPreferences = () => {
  const privacy = window.idioPrivacy;
  if (!privacy || !document.querySelector("[data-privacy-settings]") || document.querySelector("#privacy-preferences")) return;
  const dialog = document.createElement("dialog");
  dialog.id = "privacy-preferences";
  dialog.className = "privacy-dialog";
  dialog.setAttribute("aria-labelledby", "privacy-dialog-title");
  dialog.setAttribute("aria-describedby", "privacy-dialog-description");
  // Fixed local markup only; no visitor, URL, or provider content is interpolated.
  dialog.innerHTML = `
    <button class="privacy-dialog__close" type="button" aria-label="Close cookie settings and reject optional storage">×</button>
    <p class="privacy-dialog__eyebrow">a little housekeeping</p>
    <h2 id="privacy-dialog-title">your browser.<br>your call.</h2>
    <p id="privacy-dialog-description">We don’t use advertising or analytics trackers on this website. With your permission, we can remember that you’ve seen our homepage intro so you can skip it next time.</p>
    <p class="privacy-dialog__note">Optional storage stays off until you accept. We save your choice for 180 days. Newsletter signup is a separate choice.</p>
    <div class="privacy-dialog__actions">
      <button class="privacy-button" type="button" data-privacy-reject autofocus>Reject optional</button>
      <button class="privacy-button" type="button" data-privacy-accept>Accept optional</button>
    </div>
    <details class="privacy-dialog__details">
      <summary>Customize my choice</summary>
      <p><strong>Remember this choice · always on</strong><br>A small browser record remembers acceptance or rejection. Normal browser caching also helps deliver the site.</p>
      <label class="privacy-dialog__option"><input type="checkbox" name="intro-memory"><span><strong>Remember the intro · optional</strong><br>A timestamp lets us skip the intro for seven days after it’s shown. It stays in this browser and isn’t sent to Idio.</span></label>
      <p>No analytics or advertising categories are available because neither is installed on this website.</p>
      <button class="privacy-button" type="button" data-privacy-save>Save my selection</button>
    </details>
    <p class="privacy-dialog__status" role="status" aria-live="polite"></p>
    <button class="privacy-button privacy-dialog__continue" type="button" hidden>Continue without saving</button>
    <a class="privacy-dialog__policy" href="privacy.html">Read our privacy &amp; browser storage notice →</a>
  `;
  document.body.append(dialog);
  const checkbox = dialog.querySelector("input");
  const status = dialog.querySelector("[role=status]");
  const close = dialog.querySelector(".privacy-dialog__close");
  let opener = null;
  let prompted = false;
  const sync = () => {
    const preference = privacy.getPreference();
    checkbox.checked = preference?.intro === true;
    close.setAttribute("aria-label", preference
      ? "Close cookie settings without changing your saved choice"
      : "Close cookie settings and reject optional storage");
    document.querySelectorAll("[data-privacy-summary]").forEach((node) => {
      node.textContent = preference
        ? `Your current choice: intro memory ${preference.intro ? "on" : "off"}. Saved until ${new Date(preference.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`
        : "Optional intro memory is off. No browser storage choice has been saved.";
    });
  };
  const open = (trigger = null) => {
    if (dialog.open || typeof dialog.showModal !== "function" || document.querySelector("dialog[open]")) return;
    opener = trigger;
    sync();
    status.textContent = "";
    dialog.querySelector(".privacy-dialog__continue").hidden = true;
    dialog.querySelector("details").open = false;
    dialog.showModal();
    prompted = true;
  };
  const save = (intro) => {
    const persisted = privacy.save(intro);
    if (!persisted) {
      checkbox.checked = false;
      status.textContent = "Your browser prevented us from saving this choice. Optional storage is off for this page. You may be asked again on another page. Use your browser’s site-data controls to remove any older permission.";
      dialog.querySelector(".privacy-dialog__continue").hidden = false;
      return;
    }
    dialog.close();
  };
  document.querySelectorAll("[data-privacy-settings]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (typeof dialog.showModal !== "function") return;
      event.preventDefault();
      open(link);
    });
  });
  dialog.querySelector("[data-privacy-reject]").addEventListener("click", () => save(false));
  dialog.querySelector("[data-privacy-accept]").addEventListener("click", () => save(true));
  dialog.querySelector("[data-privacy-save]").addEventListener("click", () => save(checkbox.checked));
  dialog.querySelector(".privacy-dialog__continue").addEventListener("click", () => dialog.close());
  const dismiss = () => privacy.getPreference() || !dialog.querySelector(".privacy-dialog__continue").hidden
    ? dialog.close() : save(false);
  close.addEventListener("click", dismiss);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); dismiss(); });
  dialog.addEventListener("close", () => opener?.focus({ preventScroll: true }));
  window.addEventListener("idio:privacy-change", sync);
  sync();
  // The notice stays readable without an automatic popup.
  if (document.body.classList.contains("privacy-page")) return;
  const promptWhenReady = () => {
    if (prompted || privacy.getPreference() || document.body.classList.contains("is-loading")) return;
    open();
  };
  const observer = new MutationObserver(promptWhenReady);
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  promptWhenReady();
};
