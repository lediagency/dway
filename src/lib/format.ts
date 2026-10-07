const eur = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' })
const eur0 = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export const money = (n: number) => eur.format(n)
export const money0 = (n: number) => eur0.format(n)

export function shortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-BE', { day: '2-digit', month: 'short' })
}
