export default function ThemeScript() {
  const script = `
(function() {
  var key = 'prediction-market-theme';
  var stored = localStorage.getItem(key);
  var dark = stored === 'dark' ? true : stored === 'light' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
