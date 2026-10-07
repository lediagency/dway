const DWAY = '__DWAY_ORIGIN__'
const $ = (id) => document.getElementById(id)
$('open').href = `${DWAY}/revenus`

function render({ status }) {
  if (!status) return
  $('status').textContent = status.error
    ? status.error
    : status.added
      ? status.added > 1 ? `${status.added} nouvelles courses ajoutées.` : '1 nouvelle course ajoutée.'
      : 'Tout est à jour.'
  $('when').textContent = `Dernière synchro : ${new Date(status.at).toLocaleString('fr-BE', { dateStyle: 'short', timeStyle: 'short' })}`
}

chrome.storage.local.get('status').then(render)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.status) {
    render({ status: changes.status.newValue })
    $('sync').disabled = false
    $('sync').textContent = 'Synchroniser maintenant'
  }
})

$('sync').addEventListener('click', () => {
  $('sync').disabled = true
  $('sync').textContent = 'Synchronisation…'
  chrome.runtime.sendMessage({ type: 'sync-now' })
})
