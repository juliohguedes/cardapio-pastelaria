import type { CartLine, Menu, OrderRecord, Settings } from "../types";
import { SEED_MENU, SEED_SETTINGS } from "./seed";

// Toda a leitura e a gravação passam por aqui. Nesta demonstração os dados ficam no navegador;
// numa loja de verdade, só este arquivo muda para falar com um banco de dados.

const MENU = "cardapio.menu";
const SETTINGS = "cardapio.settings";
const CART = "cardapio.cart";
const ORDER = "cardapio.pedido";
const ORDERS = "cardapio.pedidos";
const FIRST_ORDER = 1001;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Devolve false quando o navegador recusa, por exemplo com o espaço cheio de fotos
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const loadMenu = () => read<Menu>(MENU, SEED_MENU);
export const saveMenu = (menu: Menu) => write(MENU, menu);

export const loadSettings = () => read<Settings>(SETTINGS, SEED_SETTINGS);
export const saveSettings = (settings: Settings) => write(SETTINGS, settings);

export const loadCart = () => read<CartLine[]>(CART, []);
export const saveCart = (cart: CartLine[]) => write(CART, cart);

export function nextOrderNumber() {
  const number = read(ORDER, FIRST_ORDER - 1) + 1;
  write(ORDER, number);
  return number;
}

export const loadOrders = () => read<OrderRecord[]>(ORDERS, []);

export function addOrder(order: OrderRecord) {
  const orders = [...loadOrders(), order];
  write(ORDERS, orders);
  return orders;
}

export function resetDemo() {
  for (const key of [MENU, SETTINGS, CART, ORDER, ORDERS]) {
    try {
      localStorage.removeItem(key);
    } catch {
      // sem acesso ao armazenamento, não há o que limpar
    }
  }
}
