# DWAY

Le cockpit du chauffeur professionnel. Next.js 16 + Supabase + Vercel.

## V1 (en cours)

- [x] Compte chauffeur (inscription, connexion, confirmation e-mail)
- [x] Dashboard : bénéfice réel, objectif 4 semaines, revenus vs dépenses, répartition
- [x] Revenus (plateformes et clients privés, commissions, pourboires, part employeur)
- [x] Dépenses (catégories, part employeur, suivi des remboursements)
- [x] Paramètres (profil, objectif, part employeur par défaut)
- [x] Import Uber : copier-coller de l'historique, ou extension Chrome DWAY Sync (synchro automatique)
- [ ] Courses · Réservations · Clients · Véhicules · Statistiques · Factures

## Calcul du bénéfice réel

```
CA net         = CA brut − commissions plateformes
Ta part        = CA net − part employeur + pourboires (100 % pour toi)
Bénéfice réel  = Ta part − dépenses à ta charge (montant − part employeur)
```
Hors impôts et cotisations sociales. Logique : `src/lib/finance.ts`.

## Lancer en local

1. Crée un projet sur supabase.com (région Europe).
2. Dans **SQL Editor**, exécute `supabase/migrations/0001_init.sql`.
3. Copie `.env.example` en `.env.local` et remplis l'URL et la clé publishable (Project Settings → API).
4. Dans Supabase → Authentication → URL Configuration, ajoute `http://localhost:3000/auth/confirm` (et l'URL Vercel plus tard) aux Redirect URLs.
5. `npm install` puis `npm run dev`, ouvre http://localhost:3000.

## Déployer sur Vercel

Importer le repo GitHub, ajouter les mêmes variables d'environnement, déployer.

## Extension Chrome DWAY Sync

Le dossier `extension/` contient une extension Chrome (Manifest V3). Elle ouvre l'historique des courses
Uber avec la session déjà ouverte dans Chrome, toutes les 3 heures et à chaque visite, puis l'envoie à
`/api/sync/uber`. Le chauffeur est reconnu par sa session DWAY. Aucun mot de passe Uber n'est lu.

`/api/extension` télécharge l'extension en .zip, réglée sur l'adresse du site qui la sert.

Sur Vercel, les variables `NEXT_PUBLIC_SUPABASE_*` doivent être actives pour **Production et Preview**,
sinon chaque page de l'aperçu répond « Internal Server Error ».
