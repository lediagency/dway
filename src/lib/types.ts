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
  kind: 'releve' | 'course'
  start_time: string | null
  pickup: string | null
  dropoff: string | null
  distance_km: number | null
  booking_id: string | null
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

export type BookingStatus = 'a_confirmer' | 'confirmee' | 'effectuee' | 'annulee'

export type Booking = {
  id: string
  number: number
  status: BookingStatus
  client_name: string
  client_phone: string | null
  date: string
  time: string
  pickup: string
  dropoff: string
  passengers: number
  vehicle: string | null
  price: number
  payment_method: PaymentMethod
  flight_number: string | null
  employer_share_pct: number
  notes: string | null
}
