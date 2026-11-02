// Preços sempre em centavos, para a conta não sofrer com arredondamento.

export type Category = { id: string; name: string };

export type Size = { id: string; name: string; price: number };

export type Addon = { id: string; name: string; price: number };

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  sizes: Size[];
  acceptsAddons: boolean;
  available: boolean;
  photo?: string; // caminho da foto ou imagem enviada no painel
};

export type Menu = { categories: Category[]; products: Product[]; addons: Addon[] };

export type Settings = { storeName: string; whatsapp: string };

export type CartLine = { id: string; productId: string; sizeId: string; addonIds: string[]; qty: number };

export type Payment = "Pix" | "Cartão na entrega" | "Dinheiro";

export type Delivery = { name: string; address: string; district: string; complement: string; payment: Payment; change: string };

export type OrderRecord = { number: number; at: number; total: number; items: number; customer: string; district: string; payment: Payment };
