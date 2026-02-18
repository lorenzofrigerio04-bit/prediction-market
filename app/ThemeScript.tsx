// Dark mode only: always apply .dark to avoid flash of light theme
export default function ThemeScript() {
  const script = `(function(){document.documentElement.classList.add('dark');})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
