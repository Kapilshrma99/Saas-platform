export const applyTheme = theme => {
  if (!theme) return;
  const root = document.documentElement;
  const clamp = (value, min, max, fallback) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return fallback;
    return Math.min(Math.max(numericValue, min), max);
  };

  root.style.setProperty('--primary', theme.primaryColor || '#2f80ed');
  root.style.setProperty('--secondary', theme.secondaryColor || '#f2c94c');
  root.style.setProperty('--font-family', theme.fontFamily || 'Inter, sans-serif');
  root.style.setProperty('--website-shell-width', `${clamp(theme.siteWidth, 960, 1680, 1600)}px`);
  root.style.setProperty('--website-hero-title-size', `${clamp(theme.heroTitleSize, 48, 96, 72)}px`);
  root.style.setProperty('--website-section-radius', `${clamp(theme.sectionRadius, 16, 48, 36)}px`);
  root.style.setProperty('--website-card-radius', `${clamp(theme.cardRadius, 12, 40, 28)}px`);
};
