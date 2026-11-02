import type { Menu, Settings } from "../types";

const pastel = (price: number) => [
  { id: "tradicional", name: "Tradicional", price },
  { id: "gigante", name: "Gigante", price: price + 700 },
];
const unico = (price: number) => [{ id: "unico", name: "Único", price }];

export const SEED_SETTINGS: Settings = { storeName: "Mão Cheia Pastelaria", whatsapp: "" };

export const SEED_MENU: Menu = {
  categories: [
    { id: "salgados", name: "Pastéis salgados" },
    { id: "doces", name: "Pastéis doces" },
    { id: "combos", name: "Combos" },
    { id: "bebidas", name: "Bebidas" },
  ],
  addons: [
    { id: "catupiry", name: "Catupiry", price: 400 },
    { id: "cheddar", name: "Cheddar", price: 400 },
    { id: "bacon", name: "Bacon", price: 500 },
    { id: "ovo", name: "Ovo", price: 250 },
    { id: "azeitona", name: "Azeitona", price: 200 },
    { id: "vinagrete", name: "Vinagrete", price: 200 },
  ],
  products: [
    { id: "carne", categoryId: "salgados", name: "Carne", description: "Carne moída temperada, com cebola e cheiro-verde.", sizes: pastel(1300), acceptsAddons: true, available: true, photo: "fotos/carne.jpg" },
    { id: "queijo", categoryId: "salgados", name: "Queijo", description: "Muçarela derretida, bem recheado até a ponta.", sizes: pastel(1200), acceptsAddons: true, available: true, photo: "fotos/queijo.jpg" },
    { id: "frango", categoryId: "salgados", name: "Frango com catupiry", description: "Frango desfiado na panela com catupiry cremoso.", sizes: pastel(1500), acceptsAddons: true, available: true, photo: "fotos/frango.jpg" },
    { id: "pizza", categoryId: "salgados", name: "Pizza", description: "Muçarela, presunto, tomate e orégano.", sizes: pastel(1400), acceptsAddons: true, available: true, photo: "fotos/pizza.jpg" },
    { id: "palmito", categoryId: "salgados", name: "Palmito", description: "Palmito refogado com tomate e azeitona.", sizes: pastel(1500), acceptsAddons: true, available: true, photo: "fotos/palmito.jpg" },
    { id: "chocolate", categoryId: "doces", name: "Chocolate com morango", description: "Chocolate ao leite e morango fresco.", sizes: unico(1500), acceptsAddons: false, available: true, photo: "fotos/chocolate.jpg" },
    { id: "banana", categoryId: "doces", name: "Banana com canela", description: "Banana, açúcar e canela, finalizado na hora.", sizes: unico(1200), acceptsAddons: false, available: true, photo: "fotos/banana.jpg" },
    { id: "combo-feira", categoryId: "combos", name: "Combo Feira", description: "1 pastel tradicional salgado e 1 caldo de cana.", sizes: unico(1900), acceptsAddons: true, available: true, photo: "fotos/combo-feira.jpg" },
    { id: "combo-familia", categoryId: "combos", name: "Combo Família", description: "4 pastéis tradicionais salgados e 1 refrigerante de 2 litros.", sizes: unico(5900), acceptsAddons: false, available: true, photo: "fotos/combo-familia.jpg" },
    { id: "caldo", categoryId: "bebidas", name: "Caldo de cana", description: "Moído na hora, com limão.", sizes: [{ id: "300", name: "300 ml", price: 800 }, { id: "500", name: "500 ml", price: 1200 }], acceptsAddons: false, available: true, photo: "fotos/caldo.jpg" },
    { id: "refri", categoryId: "bebidas", name: "Refrigerante", description: "Lata gelada, sabor a combinar.", sizes: unico(700), acceptsAddons: false, available: true, photo: "fotos/refri.jpg" },
    { id: "suco", categoryId: "bebidas", name: "Suco natural", description: "Laranja ou limão, feito na hora.", sizes: unico(1000), acceptsAddons: false, available: false, photo: "fotos/suco.jpg" },
  ],
};
