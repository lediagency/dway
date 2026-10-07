import type { Expense, Revenue } from './types'

const round = (n: number) => Math.round(n * 100) / 100

/** Ventilation d'une ligne de revenu. Les pourboires restent à 100 % au chauffeur. */
export function splitRevenue(r: Pick<Revenue, 'gross_amount' | 'platform_fees' | 'tips' | 'employer_share_pct'>) {
  const gross = Number(r.gross_amount)
  const fees = Number(r.platform_fees)
  const tips = Number(r.tips)
  const net = gross - fees
  const employer = (net * Number(r.employer_share_pct)) / 100
  return {
    gross: round(gross),
    fees: round(fees),
    net: round(net),
    employer: round(employer),
    tips: round(tips),
    mine: round(net - employer + tips),
  }
}

/** Ventilation d'une dépense : ce que je supporte vraiment, ce que l'employeur me doit. */
export function splitExpense(e: Pick<Expense, 'amount' | 'employer_share_pct' | 'reimbursed'>) {
  const amount = Number(e.amount)
  const employer = (amount * Number(e.employer_share_pct)) / 100
  return {
    amount: round(amount),
    employer: round(employer),
    mine: round(amount - employer),
    toReimburse: e.reimbursed ? 0 : round(employer),
  }
}

export type Totals = {
  gross: number
  fees: number
  net: number
  employer: number
  tips: number
  myRevenue: number
  expenses: number
  myExpenses: number
  toReimburse: number
  profit: number
  rides: number
}

/**
 * Bénéfice réel = (CA net − part employeur + pourboires) − dépenses à ma charge.
 * Hors impôts et cotisations sociales.
 */
export function computeTotals(revenues: Revenue[], expenses: Expense[]): Totals {
  const t = { gross: 0, fees: 0, net: 0, employer: 0, tips: 0, myRevenue: 0, expenses: 0, myExpenses: 0, toReimburse: 0, rides: 0 }
  for (const r of revenues) {
    const s = splitRevenue(r)
    t.gross += s.gross
    t.fees += s.fees
    t.net += s.net
    t.employer += s.employer
    t.tips += s.tips
    t.myRevenue += s.mine
    t.rides += r.rides_count
  }
  for (const e of expenses) {
    const s = splitExpense(e)
    t.expenses += s.amount
    t.myExpenses += s.mine
    t.toReimburse += s.toReimburse
  }
  const out = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, round(v)])) as Omit<Totals, 'profit'>
  return { ...out, profit: round(out.myRevenue - out.myExpenses) }
}
