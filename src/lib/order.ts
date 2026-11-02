import type { Addon, CartLine, Delivery, Menu, Product, Size } from "../types";
import { money } from "./money";

export type ResolvedLine = { line: CartLine; product: Product; size: Size; addons: Addon[]; unitPrice: number; total: number };

// O carrinho guarda só os ids: nome e preço vêm sempre do cardápio atual.
// Item apagado ou esgotado no painel sai do carrinho.
export function resolveLine(menu: Menu, line: CartLine): ResolvedLine | null {
  const product = menu.products.find((p) => p.id === line.productId);
  const size = product?.sizes.find((s) => s.id === line.sizeId);
  if (!product || !size || !product.available) return null;
  const addons = menu.addons.filter((a) => line.addonIds.includes(a.id));
  const unitPrice = size.price + addons.reduce((sum, a) => sum + a.price, 0);
  return { line, product, size, addons, unitPrice, total: unitPrice * line.qty };
}

export const resolveCart = (menu: Menu, cart: CartLine[]) => cart.map((l) => resolveLine(menu, l)).filter((l) => l !== null);

export const cartTotal = (lines: ResolvedLine[]) => lines.reduce((sum, l) => sum + l.total, 0);

export const cartCount = (lines: ResolvedLine[]) => lines.reduce((sum, l) => sum + l.line.qty, 0);

// Mesmo item com as mesmas escolhas soma na mesma linha
export function addToCart(cart: CartLine[], item: Omit<CartLine, "id">): CartLine[] {
  const key = (l: Omit<CartLine, "id">) => [l.productId, l.sizeId, [...l.addonIds].sort().join("+")].join("|");
  const same = cart.find((l) => key(l) === key(item));
  if (same) return cart.map((l) => (l === same ? { ...l, qty: l.qty + item.qty } : l));
  return [...cart, { ...item, id: crypto.randomUUID() }];
}

export function orderMessage(storeName: string, number: number, lines: ResolvedLine[], d: Delivery) {
  const items = lines.flatMap((l) => {
    const size = l.product.sizes.length > 1 ? ` (${l.size.name})` : "";
    const row = `${l.line.qty}x ${l.product.name}${size} - ${money(l.total)}`;
    return l.addons.length ? [row, `   + ${l.addons.map((a) => a.name).join(", ")}`] : [row];
  });
  const change = d.payment === "Dinheiro" && d.change.trim() ? ` (troco para ${d.change.trim()})` : "";
  return [
    `*${storeName}*`,
    `*Pedido #${number}*`,
    "",
    ...items,
    "",
    `*Total: ${money(cartTotal(lines))}*`,
    "",
    "*Entrega*",
    d.name.trim(),
    d.address.trim(),
    d.district.trim(),
    ...(d.complement.trim() ? [d.complement.trim()] : []),
    "",
    `*Pagamento:* ${d.payment}${change}`,
  ].join("\n");
}

// Sem número configurado, o WhatsApp abre e pede para escolher o contato
export function whatsappUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
