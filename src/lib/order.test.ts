import { describe, expect, it } from "vitest";
import { SEED_MENU } from "../data/seed";
import type { CartLine, Delivery } from "../types";
import { money, moneyField, parseMoney } from "./money";
import { orderStats } from "./stats";
import { addToCart, cartCount, cartTotal, orderMessage, resolveCart, resolveLine, whatsappUrl } from "./order";

const line = (over: Partial<CartLine> = {}): CartLine => ({ id: "a", productId: "carne", sizeId: "tradicional", addonIds: [], qty: 1, ...over });
const delivery: Delivery = { name: "Ana", address: "Rua das Flores, 10", district: "Centro", complement: "", payment: "Pix", change: "" };

describe("preço", () => {
  it("soma tamanho e adicionais, vezes a quantidade", () => {
    const r = resolveLine(SEED_MENU, line({ sizeId: "gigante", addonIds: ["catupiry", "bacon"], qty: 2 }));
    expect(r?.unitPrice).toBe(2000 + 400 + 500);
    expect(r?.total).toBe(5800);
  });

  it("soma o carrinho inteiro", () => {
    const lines = resolveCart(SEED_MENU, [line({ qty: 2 }), line({ id: "b", productId: "refri", sizeId: "unico" })]);
    expect(cartTotal(lines)).toBe(3300);
    expect(cartCount(lines)).toBe(3);
  });

  it("tira do carrinho item apagado ou esgotado", () => {
    expect(resolveLine(SEED_MENU, line({ productId: "nao-existe" }))).toBeNull();
    expect(resolveLine(SEED_MENU, line({ productId: "suco", sizeId: "unico" }))).toBeNull();
  });
});

describe("carrinho", () => {
  it("junta escolhas iguais, mesmo em outra ordem", () => {
    const once = addToCart([], { productId: "carne", sizeId: "tradicional", addonIds: ["ovo", "bacon"], qty: 1 });
    const twice = addToCart(once, { productId: "carne", sizeId: "tradicional", addonIds: ["bacon", "ovo"], qty: 2 });
    expect(twice).toHaveLength(1);
    expect(twice[0].qty).toBe(3);
  });

  it("separa escolhas diferentes", () => {
    const once = addToCart([], { productId: "carne", sizeId: "tradicional", addonIds: [], qty: 1 });
    expect(addToCart(once, { productId: "carne", sizeId: "gigante", addonIds: [], qty: 1 })).toHaveLength(2);
  });
});

describe("mensagem do WhatsApp", () => {
  it("traz número, itens, total, endereço e pagamento", () => {
    const lines = resolveCart(SEED_MENU, [line({ addonIds: ["catupiry"], qty: 2 })]);
    const text = orderMessage("Mão Cheia", 1001, lines, { ...delivery, payment: "Dinheiro", change: "R$ 50" });
    expect(text).toContain("*Pedido #1001*");
    expect(text).toContain("2x Carne (Tradicional)");
    expect(text).toContain("+ Catupiry");
    expect(text).toContain(`*Total: ${money(3400)}*`);
    expect(text).toContain("Rua das Flores, 10");
    expect(text).toContain("Dinheiro (troco para R$ 50)");
  });

  it("não mostra tamanho de item com tamanho único", () => {
    const lines = resolveCart(SEED_MENU, [line({ productId: "refri", sizeId: "unico" })]);
    expect(orderMessage("X", 1, lines, delivery)).toContain("1x Refrigerante - ");
  });

  it("monta o link com o número só em dígitos e o texto codificado", () => {
    expect(whatsappUrl("(11) 91234-5678", "a b&c")).toBe("https://wa.me/11912345678?text=a%20b%26c");
    expect(whatsappUrl("", "oi")).toBe("https://wa.me/?text=oi");
  });
});

describe("campo de preço", () => {
  it("entende o jeito brasileiro", () => {
    expect(parseMoney("12,50")).toBe(1250);
    expect(parseMoney("R$ 1.200,00")).toBe(120000);
    expect(parseMoney("7")).toBe(700);
  });

  it("recusa o que não é preço", () => {
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("-3")).toBeNull();
  });

  it("volta para o campo com vírgula", () => {
    expect(moneyField(1250)).toBe("12,50");
  });
});

describe("total de pedidos", () => {
  const order = (at: string, total: number) => ({ number: 1, at: new Date(at).getTime(), total, items: 1, customer: "Ana", district: "Centro", payment: "Pix" as const });

  it("conta o total, os de hoje, o valor e a média", () => {
    const stats = orderStats([order("2026-11-01T12:00:00", 1000), order("2026-11-02T12:00:00", 2001)], new Date("2026-11-02T20:00:00"));
    expect(stats).toEqual({ total: 2, today: 1, revenue: 3001, average: 1501 });
  });

  it("sem pedidos, tudo zero", () => {
    expect(orderStats([], new Date())).toEqual({ total: 0, today: 0, revenue: 0, average: 0 });
  });
});
