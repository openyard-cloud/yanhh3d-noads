// Keeps the list of domains YanHH3D has used. For each one:
// - a network rule blocks every script the page loads from another site,
//   except the libraries it needs (jQuery, Alpine);
// - guard.js runs there even if the name has no "yanhh3d" in it.
const NEEDED = ["cdnjs.cloudflare.com", "cdn.jsdelivr.net"];
const looksLikeIt = (host) => /yanhh3d/i.test(host);
const bare = (host) => host.replace(/^www\./, "");

async function apply(sites) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: sites.length ? [{
      id: 1,
      priority: 1,
      action: { type: "block" },
      condition: { initiatorDomains: sites, excludedRequestDomains: [...sites, ...NEEDED], resourceTypes: ["script"] },
    }] : [],
  });
  const others = sites.filter((s) => !looksLikeIt(s));
  const old = await chrome.scripting.getRegisteredContentScripts({ ids: ["learned"] });
  if (old.length) await chrome.scripting.unregisterContentScripts({ ids: ["learned"] });
  if (others.length) {
    await chrome.scripting.registerContentScripts([{
      id: "learned",
      matches: others.map((s) => `*://*.${s}/*`),
      js: ["force.js"],
      runAt: "document_start",
      world: "MAIN",
      persistAcrossSessions: true,
    }]);
  }
}

let queue = Promise.resolve();
function learn(host, tabId) {
  queue = queue.then(async () => {
    const site = bare(host);
    const { sites = [] } = await chrome.storage.local.get("sites");
    if (sites.includes(site)) return;
    sites.push(site);
    await chrome.storage.local.set({ sites });
    await apply(sites);
    console.log("[noads] thêm tên miền", site);
    // A domain recognised only after the page loaded: reload so it starts protected.
    if (tabId != null && !looksLikeIt(site)) chrome.tabs.reload(tabId);
  }).catch((e) => console.error("[noads]", e));
}

// Runs before the request goes out, so the first visit to a new domain is covered.
chrome.webNavigation.onBeforeNavigate.addListener((d) => {
  if (d.frameId === 0) learn(new URL(d.url).hostname);
}, { url: [{ hostContains: "yanhh3d" }] });

chrome.runtime.onMessage.addListener((m, sender) => {
  if (m.site && sender.tab && new URL(sender.tab.url).hostname === m.site) learn(m.site, sender.tab.id);
});

chrome.runtime.onInstalled.addListener(async () => {
  const { sites = [] } = await chrome.storage.local.get("sites");
  if (!sites.includes("yanhh3d.baby")) sites.push("yanhh3d.baby");
  await chrome.storage.local.set({ sites });
  await apply(sites);
});
