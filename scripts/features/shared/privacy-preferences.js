export const initPrivacyPreferences = () => {
  const privacy = window.idioPrivacy;
  if (!privacy || !document.querySelector("[data-privacy-settings]") || document.querySelector("#privacy-preferences")) return;
  const dialog = document.createElement("dialog");
  if (typeof dialog.showModal !== "function") return;
  dialog.id = "privacy-preferences";
  dialog.className = "privacy-dialog";
  dialog.setAttribute("aria-labelledby", "privacy-dialog-title");
  dialog.setAttribute("aria-describedby", "privacy-dialog-description");
  const buttonLabel = (label) => `<span class="button-fill__label">${label}</span><span class="button-fill__inner" aria-hidden="true"><span class="button-fill__blobs"><span class="button-fill__blob"></span><span class="button-fill__blob"></span><span class="button-fill__blob"></span><span class="button-fill__blob"></span></span></span>`;
  // Fixed local labels only; no visitor, URL, or provider content is interpolated.
  dialog.innerHTML = `
    <button class="privacy-dialog__close" type="button" aria-label="Close cookie settings and reject optional storage">×</button>
    <p class="privacy-dialog__eyebrow">a little housekeeping</p>
    <h2 id="privacy-dialog-title" tabindex="-1" autofocus>your browser.<br>your call.</h2>
    <p id="privacy-dialog-description">We don’t use advertising or analytics trackers on this website. With your permission, we can remember your preference for a shorter homepage intro: “make it yours”, then “make it idio”.</p>
    <p class="privacy-dialog__note">Optional storage stays off until you accept. We save your choice for 180 days. Newsletter signup is a separate choice.</p>
    <div class="privacy-dialog__actions">
      <button class="privacy-button privacy-button--animated" type="button" data-privacy-accept>${buttonLabel("Accept optional")}</button>
      <button class="privacy-button privacy-button--animated privacy-button--outline" type="button" data-privacy-reject>${buttonLabel("Reject optional")}</button>
    </div>
    <details class="privacy-dialog__details">
      <summary>Customize my choice</summary>
      <p><strong>Remember this choice · always on</strong><br>A small browser record remembers acceptance or rejection. Normal browser caching also helps deliver the site.</p>
      <label class="privacy-dialog__option"><input type="checkbox" name="intro-memory"><span><strong>Shorter homepage intro · optional</strong><br>Opt in for “make it yours”, then “make it idio” on future homepage visits. Otherwise, you’ll see the full intro. This choice stays in your browser and isn’t sent to Idio.</span></label>
      <p>No analytics or advertising categories are available because neither is installed on this website.</p>
      <button class="privacy-button privacy-button--animated" type="button" data-privacy-save>${buttonLabel("Save my selection")}</button>
    </details>
    <p class="privacy-dialog__status" role="status" aria-live="polite"></p>
    <button class="privacy-button privacy-button--animated privacy-dialog__continue" type="button" hidden>${buttonLabel("Continue without saving")}</button>
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
        ? `Your current choice: shorter intro ${preference.intro ? "on" : "off"}. Saved until ${new Date(preference.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`
        : "The full intro is enabled. No browser storage choice has been saved.";
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
  if (document.body.classList.contains("privacy-page") || privacy.getPreference()) return;
  const promptWhenReady = () => {
    if (prompted || privacy.getPreference() || document.body.classList.contains("is-loading")) return;
    open();
    if (prompted) {
      observer.disconnect();
      document.removeEventListener("close", promptWhenReady, true);
    }
  };
  const observer = new MutationObserver(promptWhenReady);
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("close", promptWhenReady, true);
  promptWhenReady();
};
