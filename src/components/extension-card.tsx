import { Download } from 'lucide-react'

const steps = [
  <>Clique sur <b>Télécharger l’extension</b>.</>,
  <>Ouvre ton dossier <b>Téléchargements</b>, fais un clic droit sur <b>dway-sync.zip</b>, puis <b>Extraire tout</b> et <b>Extraire</b>.</>,
  <>Dans Chrome, tape <b>chrome://extensions</b> dans la barre d’adresse, puis active <b>Mode développeur</b> en haut à droite.</>,
  <>Clique sur <b>Charger l’extension non empaquetée</b> et choisis le dossier <b>dway-sync</b>.</>,
  <>Ouvre une fois <b>drivers.uber.com</b> et connecte-toi. C’est tout : DWAY se met à jour tout seul.</>,
]

/** Installation de l’extension DWAY Sync (synchronisation automatique Uber). */
export function ExtensionCard() {
  return (
    <section className="card-glow mb-4 grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="eyebrow">Synchronisation automatique</p>
        <ol className="mt-4 space-y-2.5 text-sm text-muted">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-fg">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted/80">
          L’extension utilise ta session Uber déjà ouverte dans Chrome et envoie tes courses directement à DWAY, toutes les 3 heures
          et chaque fois que tu ouvres ton historique. Aucun intermédiaire, et ton mot de passe Uber n’est jamais lu.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <a href="/api/extension" download className="btn-primary px-5 py-3">
          <Download className="size-4" />Télécharger l’extension
        </a>
        <span className="text-[11px] text-muted">Chrome sur ordinateur</span>
      </div>
    </section>
  )
}
