export type RevenueSource =
  | 'uber' | 'bolt' | 'heetch' | 'blacklane' | 'sixt_ride' | 'taxi_vert' | 'prive' | 'autre'

export type PaymentMethod = 'app' | 'cash' | 'carte' | 'virement'

export type ExpenseCategory =
  | 'carburant' | 'recharge' | 'peage_parking' | 'lavage' | 'entretien' | 'assurance'
  | 'leasing' | 'telephone' | 'abonnement' | 'amende' | 'repas' | 'autre'

export type Profile = {
  id: string
  full_name: string | null
  company_name: string | null
  vat_number: string | null
  phone: string | null
  goal_4w: number
  default_employer_share: number
}

export type Revenue = {
  id: string
  date: string
  source: RevenueSource
  label: string | null
  rides_count: number
  gross_amount: number
  platform_fees: number
  tips: number
  payment_method: PaymentMethod
  employer_share_pct: number
  notes: string | null
}

export type Expense = {
  id: string
  date: string
  category: ExpenseCategory
  label: string | null
  amount: number
  employer_share_pct: number
  reimbursed: boolean
  notes: string | null
}
