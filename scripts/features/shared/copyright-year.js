export const initCopyrightYear = () => {
  const years = document.querySelectorAll("[data-copyright-year]");
  if (!years.length) return;

  const currentYear = String(new Date().getFullYear());
  years.forEach(year => {
    year.textContent = currentYear;
  });
};
