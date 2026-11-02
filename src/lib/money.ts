export const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\s/g, " ");

// "12,50" no painel vira 1250; texto que não é preço vira null
export function parseMoney(text: string): number | null {
  const clean = text.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

export const moneyField = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
