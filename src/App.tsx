import { useEffect, useMemo, useState } from "react";
import { Admin } from "./components/Admin";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { ItemSheet } from "./components/ItemSheet";
import { Photo } from "./components/Photo";
import { Sheet } from "./components/Sheet";
import { addOrder, loadCart, loadMenu, loadOrders, loadSettings, nextOrderNumber, resetDemo, saveCart, saveMenu, saveSettings } from "./data/store";
import { money } from "./lib/money";
import { addToCart, cartCount, cartTotal, orderMessage, resolveCart, whatsappUrl } from "./lib/order";
import type { CartLine, Delivery, Menu, OrderRecord, Product, Settings } from "./types";

type Sent = { number: number; url: string };

const useRoute = () => {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const change = () => setHash(location.hash);
    addEventListener("hashchange", change);
    return () => removeEventListener("hashchange", change);
  }, []);
  return hash === "#/admin" ? "admin" : "menu";
};

// Marca nas abas a categoria que está na tela
function useActiveCategory(ids: string[], enabled: boolean) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!enabled) return;
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-90px 0px -70% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) watch.observe(el);
    }
    return () => watch.disconnect();
  }, [ids.join(), enabled]);
  return active;
}

function Header({ name }: { name: string }) {
  return (
    <header className="hero">
      <img className="hero-photo" src="fotos/capa.jpg" alt="" />
      <div className="hero-in">
        <span className="badge">Pedidos pelo WhatsApp</span>
        <h1>{name}</h1>
        <p>Pastel frito na hora, do jeito da feira. Escolha, monte o pedido e combine o pagamento na entrega.</p>
      </div>
    </header>
  );
}

function ItemCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const from = Math.min(...product.sizes.map((s) => s.price));
  return (
    <li>
      <button className="item" onClick={onOpen} disabled={!product.available}>
        <span className="item-text">
          <b>{product.name}</b>
          <small>{product.description}</small>
          <span className="price-tag">
            {!product.available ? (
              "Esgotado"
            ) : (
              <>
                {product.sizes.length > 1 && <em>a partir de </em>}
                {money(from)}
              </>
            )}
          </span>
        </span>
        <Photo src={product.photo} alt="" />
      </button>
    </li>
  );
}

export function App() {
  const route = useRoute();
  const [menu, setMenu] = useState<Menu>(loadMenu);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [cart, setCart] = useState<CartLine[]>(loadCart);
  const [orders, setOrders] = useState<OrderRecord[]>(loadOrders);
  const [open, setOpen] = useState<Product | null>(null);
  const [panel, setPanel] = useState<"cart" | "checkout" | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [resets, setResets] = useState(0); // recria o painel ao apagar as alterações

  const shown = menu.categories.filter((c) => menu.products.some((p) => p.categoryId === c.id));
  const active = useActiveCategory(shown.map((c) => c.id), route === "menu");

  const lines = useMemo(() => resolveCart(menu, cart), [menu, cart]);
  const count = cartCount(lines);
  const total = cartTotal(lines);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    document.title = settings.storeName;
  }, [settings.storeName]);

  function setQty(id: string, qty: number) {
    setCart((list) => (qty < 1 ? list.filter((l) => l.id !== id) : list.map((l) => (l.id === id ? { ...l, qty } : l))));
  }

  function send(delivery: Delivery) {
    const number = nextOrderNumber();
    const url = whatsappUrl(settings.whatsapp, orderMessage(settings.storeName, number, lines, delivery));
    window.open(url, "_blank", "noopener");
    setOrders(addOrder({ number, at: Date.now(), total, items: count, customer: delivery.name.trim(), district: delivery.district.trim(), payment: delivery.payment }));
    setCart([]);
    setPanel(null);
    setSent({ number, url });
  }

  if (route === "admin")
    return (
      <Admin
        key={resets}
        menu={menu}
        settings={settings}
        orders={orders}
        onMenu={(next) => {
          setMenu(next);
          return saveMenu(next);
        }}
        onSettings={(next) => {
          setSettings(next);
          saveSettings(next);
        }}
        onReset={() => {
          resetDemo();
          setMenu(loadMenu());
          setSettings(loadSettings());
          setOrders(loadOrders());
          setCart([]);
          setResets((n) => n + 1);
        }}
      />
    );

  const cartBox = <Cart lines={lines} onQty={setQty} onCheckout={() => setPanel("checkout")} />;

  return (
    <>
      <Header name={settings.storeName} />
      <nav className="cats" aria-label="Categorias">
        <div className="cats-in">
          {shown.map((c) => (
            <button key={c.id} className={c.id === active ? "on" : ""} onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth" })}>
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="layout">
        <main>
          {shown.map((c) => (
            <section key={c.id} id={c.id} className="cat">
              <h2>{c.name}</h2>
              <ul className="items">
                {menu.products
                  .filter((p) => p.categoryId === c.id)
                  .map((p) => (
                    <ItemCard key={p.id} product={p} onOpen={() => setOpen(p)} />
                  ))}
              </ul>
            </section>
          ))}
          <footer className="foot">
            <span>Loja fictícia, criada para demonstração.</span>
            <a href="#/admin">Painel da loja</a>
            <a href="https://github.com/juliohguedes/cardapio-pastelaria/blob/main/CREDITOS.md">Créditos das fotos</a>
          </footer>
        </main>
        <aside className="side" aria-label="Carrinho">
          <h2>Seu pedido</h2>
          {cartBox}
        </aside>
      </div>

      {count > 0 && (
        <button className="cart-bar" onClick={() => setPanel("cart")}>
          <span className="cart-count">{count}</span>
          Ver carrinho
          <b>{money(total)}</b>
        </button>
      )}

      {open && <ItemSheet product={open} addons={menu.addons} onClose={() => setOpen(null)} onAdd={(item) => setCart((c) => addToCart(c, item))} />}
      {panel === "cart" && (
        <Sheet title="Seu pedido" onClose={() => setPanel(null)}>
          <div className="sheet-body">{cartBox}</div>
        </Sheet>
      )}
      {panel === "checkout" && (
        <Sheet title="Dados da entrega" onClose={() => setPanel(null)}>
          <Checkout lines={lines} onSend={send} onBack={() => setPanel(innerWidth < 900 ? "cart" : null)} />
        </Sheet>
      )}
      {sent && (
        <Sheet title={`Pedido #${sent.number}`} onClose={() => setSent(null)}>
          <div className="sheet-body">
            <p>Seu pedido foi preparado no WhatsApp. Confira a mensagem e toque em enviar para a loja receber.</p>
            <a className="btn whatsapp" href={sent.url} target="_blank" rel="noreferrer">
              Abrir o WhatsApp de novo
            </a>
          </div>
        </Sheet>
      )}
    </>
  );
}
