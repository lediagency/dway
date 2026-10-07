# DWAY

Le cockpit du chauffeur professionnel. Next.js 16 + Supabase + Vercel.

## V1 (en cours)

- [x] Compte chauffeur (inscription, connexion, confirmation e-mail)
- [x] Dashboard : bénéfice réel, objectif 4 semaines, revenus vs dépenses, répartition
- [x] Revenus (plateformes et clients privés, commissions, pourboires, part employeur)
- [x] Dépenses (catégories, part employeur, suivi des remboursements)
- [x] Paramètres (profil, objectif, part employeur par défaut)
- [x] Courses (trajets détaillés, €/km) : une course est une ligne de revenu, donc jamais comptée deux fois
- [x] Réservations privées (RÉSERVATION #XXX, récap à copier pour WhatsApp, « Effectuée » crée la course)
- [ ] Clients · Véhicules · Statistiques · Factures

## Calcul du bénéfice réel

```
CA net         = CA brut − commissions plateformes
Ta part        = CA net − part employeur + pourboires (100 % pour toi)
Bénéfice réel  = Ta part − dépenses à ta charge (montant − part employeur)
```
Hors impôts et cotisations sociales. Logique : `src/lib/finance.ts`.

## Lancer en local

1. Crée un projet sur supabase.com (région Europe).
2. Dans **SQL Editor**, exécute les fichiers de `supabase/migrations/` dans l'ordre (0001, puis 0002…).
3. Copie `.env.example` en `.env.local` et remplis l'URL et la clé publishable (Project Settings → API).
4. Dans Supabase → Authentication → URL Configuration, ajoute `http://localhost:3000/auth/confirm` (et l'URL Vercel plus tard) aux Redirect URLs.
5. `npm install` puis `npm run dev`, ouvre http://localhost:3000.

## Déployer sur Vercel

Importer le repo GitHub, ajouter les mêmes variables d'environnement, déployer.
