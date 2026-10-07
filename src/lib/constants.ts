import type { ExpenseCategory, PaymentMethod, RevenueSource } from './types'

export const SOURCES: Record<RevenueSource, string> = {
  uber: 'Uber',
  bolt: 'Bolt',
  heetch: 'Heetch',
  blacklane: 'Blacklane',
  sixt_ride: 'Sixt Ride',
  taxi_vert: 'Taxi Vert',
  prive: 'Client privé',
  autre: 'Autre',
}

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  app: 'Via l’app',
  cash: 'Cash',
  carte: 'Carte',
  virement: 'Virement',
}

export const CATEGORIES: Record<ExpenseCategory, string> = {
  carburant: 'Carburant',
  recharge: 'Recharge électrique',
  peage_parking: 'Péage / parking',
  lavage: 'Lavage',
  entretien: 'Entretien',
  assurance: 'Assurance',
  leasing: 'Leasing',
  telephone: 'Téléphone',
  abonnement: 'Abonnement',
  amende: 'Amende',
  repas: 'Repas',
  autre: 'Autre',
}

// Part employeur proposée par défaut selon la catégorie (modifiable à la saisie).
export const DEFAULT_EXPENSE_SHARE: Partial<Record<ExpenseCategory, number>> = {
  carburant: 50,
  recharge: 50,
}
