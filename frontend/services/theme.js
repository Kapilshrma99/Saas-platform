export const applyTheme = theme => {
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primaryColor || '#2f80ed');
  root.style.setProperty('--secondary', theme.secondaryColor || '#f2c94c');
  root.style.setProperty('--font-family', theme.fontFamily || 'Inter, sans-serif');
};
