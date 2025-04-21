export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Get the stored theme from localStorage
              var storedTheme = localStorage.getItem('theme');
              
              // If no stored theme, use the default (light)
              if (!storedTheme) {
                storedTheme = 'light';
              }
              
              // If system theme, check user's preference
              if (storedTheme === 'system') {
                storedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              
              // Apply the theme to the HTML element
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(storedTheme);
              
              console.log('Theme initialized to:', storedTheme);
            } catch (e) {
              console.error('Error initializing theme:', e);
            }
          })();
        `,
      }}
    />
  );
}
