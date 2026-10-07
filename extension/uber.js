// Sur drivers.uber.com : dès que l'historique des courses est affiché, l'envoie à DWAY.
const ROW = /(?:mon|tue|wed|thu|fri|sat|sun)\w*\.?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+\d{1,2},?\s+\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm)/i

let last = ''
let stableSince = 0
let sent = ''

setInterval(() => {
  if (!location.pathname.includes('/earnings/trips')) return
  const text = document.body.innerText
  if (!ROW.test(text)) return
  // On attend que la page ait fini de se remplir (texte identique pendant 3 s).
  if (text !== last) {
    last = text
    stableSince = Date.now()
    return
  }
  if (Date.now() - stableSince < 3000 || text === sent) return
  sent = text
  chrome.runtime.sendMessage({ type: 'uber-trips', text })
}, 1000)
