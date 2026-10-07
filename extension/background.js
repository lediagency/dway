// DWAY Sync : récupère l'historique des courses Uber avec la session déjà ouverte dans Chrome
// et l'envoie directement à DWAY. Aucun mot de passe n'est lu ni stocké.
const DWAY = '__DWAY_ORIGIN__'
const TRIPS = 'https://drivers.uber.com/earnings/trips'
const EVERY_MINUTES = 180
const TIMEOUT_MINUTES = 2

function schedule() {
  chrome.alarms.create('sync', { delayInMinutes: 1, periodInMinutes: EVERY_MINUTES })
}
chrome.runtime.onInstalled.addListener(schedule)
chrome.runtime.onStartup.addListener(schedule)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync') openTrips()
  if (alarm.name === 'timeout') giveUp()
})

/** Ouvre l'historique Uber dans une fenêtre réduite : le script de page fait le reste. */
async function openTrips() {
  const { syncWindow } = await chrome.storage.session.get('syncWindow')
  if (syncWindow) return
  const win = await chrome.windows.create({ url: TRIPS, focused: false, state: 'minimized' })
  await chrome.storage.session.set({ syncWindow: win.id })
  chrome.alarms.create('timeout', { delayInMinutes: TIMEOUT_MINUTES })
}

async function closeSyncWindow() {
  const { syncWindow } = await chrome.storage.session.get('syncWindow')
  await chrome.storage.session.remove('syncWindow')
  chrome.alarms.clear('timeout')
  if (syncWindow) chrome.windows.remove(syncWindow).catch(() => {})
}

async function giveUp() {
  await closeSyncWindow()
  await setStatus({ error: 'Uber ne s’est pas ouvert. Connecte-toi à drivers.uber.com dans Chrome.' })
}

async function setStatus(status) {
  await chrome.storage.local.set({ status: { ...status, at: Date.now() } })
  chrome.action.setBadgeBackgroundColor({ color: status.error ? '#71717a' : '#e4e4e7' })
  chrome.action.setBadgeText({ text: status.error ? '!' : status.added ? String(status.added) : '' })
}

async function send(text) {
  try {
    const res = await fetch(`${DWAY}/api/sync/uber`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setStatus({ error: data.error || 'DWAY ne répond pas. Réessaie plus tard.' })
    return setStatus({ added: data.added, skipped: data.skipped })
  } catch {
    return setStatus({ error: 'DWAY ne répond pas. Vérifie ta connexion internet.' })
  }
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'uber-trips') {
    send(msg.text).then(async () => {
      const { syncWindow } = await chrome.storage.session.get('syncWindow')
      if (sender.tab && sender.tab.windowId === syncWindow) await closeSyncWindow()
    })
  }
  if (msg.type === 'sync-now') {
    openTrips().then(() => reply(true))
    return true
  }
})

chrome.windows.onRemoved.addListener(async (id) => {
  const { syncWindow } = await chrome.storage.session.get('syncWindow')
  if (id === syncWindow) {
    await chrome.storage.session.remove('syncWindow')
    chrome.alarms.clear('timeout')
  }
})
