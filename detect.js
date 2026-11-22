// Recognises YanHH3D when it moves to a domain without "yanhh3d" in the name:
// every page names the site in og:site_name and sets APP_URL to its own origin.
(() => {
  if (/yanhh3d/i.test(location.hostname)) return;
  const name = document.querySelector('meta[property="og:site_name"]')?.content || "";
  if (!/^\s*YanHH3D\b/i.test(name)) return;
  const own = [...document.scripts].some((s) => {
    const m = /APP_URL\s*=\s*["']([^"']+)["']/.exec(s.textContent);
    try { return m && new URL(m[1]).hostname === location.hostname; } catch { return false; }
  });
  if (own) chrome.runtime.sendMessage({ site: location.hostname });
})();
