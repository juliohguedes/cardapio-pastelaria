import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { money, moneyField, parseMoney } from "../lib/money";
import { orderStats } from "../lib/stats";
import type { Addon, Category, Menu, OrderRecord, Product, Settings, Size } from "../types";
import { Photo } from "./Photo";
import { Sheet } from "./Sheet";

type Props = {
  menu: Menu;
  settings: Settings;
  orders: OrderRecord[];
  onMenu: (menu: Menu) => boolean;
  onSettings: (settings: Settings) => void;
  onReset: () => void;
};

type Tab = "resumo" | "produtos" | "adicionais" | "loja";

const TABS: { id: Tab; name: string }[] = [
  { id: "resumo", name: "Resumo" },
  { id: "produtos", name: "Produtos" },
  { id: "adicionais", name: "Adicionais" },
  { id: "loja", name: "Loja" },
];

const newId = () => crypto.randomUUID().slice(0, 8);

// Reduz a foto antes de guardar: o espaço do navegador é pequeno
function shrinkPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 640 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("foto inválida"));
    };
    img.src = url;
  });
}

function PriceInput({ cents, onChange, label }: { cents: number; onChange: (cents: number) => void; label: string }) {
  const [text, setText] = useState(moneyField(cents));
  const bad = parseMoney(text) === null;
  return (
    <span className={bad ? "price-field bad" : "price-field"}>
      <span aria-hidden="true">R$</span>
      <input
        inputMode="decimal"
        aria-label={label}
        aria-invalid={bad}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const value = parseMoney(e.target.value);
          if (value !== null) onChange(value);
        }}
      />
    </span>
  );
}

function ProductForm({ menu, product, isNew, onSave, onDelete, onCategory, onClose }: {
  menu: Menu;
  product: Product;
  isNew: boolean;
  onSave: (p: Product) => void;
  onDelete: () => void;
  onCategory: (c: Category) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState(product);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const set = (patch: Partial<Product>) => setP((old) => ({ ...old, ...patch }));
  const setSize = (id: string, patch: Partial<Size>) => set({ sizes: p.sizes.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  async function takePhoto(file?: File) {
    if (!file) return;
    try {
      set({ photo: await shrinkPhoto(file) });
      setError("");
    } catch {
      setError("Não consegui abrir essa foto. Tente outra imagem.");
    }
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    takePhoto(e.dataTransfer.files[0]);
  }

  function addCategory() {
    const name = newCategory?.trim();
    if (!name) return;
    const category = { id: newId(), name };
    onCategory(category);
    set({ categoryId: category.id });
    setNewCategory(null);
  }

  const valid = p.name.trim() && p.sizes.length > 0 && p.sizes.every((s) => s.name.trim());

  return (
    <Sheet title={isNew ? "Novo produto" : "Editar produto"} onClose={onClose}>
      <div className="sheet-body">
        <label
          className={dragging ? "photo-drop on" : "photo-drop"}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
        >
          <Photo src={p.photo} alt={p.name} />
          <span className="photo-drop-text">{p.photo ? "Trocar foto" : "Enviar foto"}</span>
          <input type="file" accept="image/*" aria-label="Foto do produto" onChange={(e: ChangeEvent<HTMLInputElement>) => takePhoto(e.target.files?.[0])} />
        </label>
        {p.photo && (
          <button type="button" className="text-btn" onClick={() => set({ photo: undefined })}>
            Remover foto
          </button>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <label className="field">
          <span>Nome</span>
          <input value={p.name} placeholder="Ex.: Pastel de camarão" onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="field">
          <span>Descrição</span>
          <textarea rows={2} value={p.description} onChange={(e) => set({ description: e.target.value })} />
        </label>

        <div className="field">
          <label htmlFor="categoria">Categoria</label>
          {newCategory === null ? (
            <div className="row">
              <select id="categoria" className="grow" value={p.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                {menu.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setNewCategory("")}>
                Nova
              </button>
            </div>
          ) : (
            <div className="row">
              <input id="categoria" className="grow" autoFocus placeholder="Nome da categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <button type="button" onClick={addCategory} disabled={!newCategory.trim()}>
                Criar
              </button>
              <button type="button" className="text-btn" onClick={() => setNewCategory(null)}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        <fieldset className="choices">
          <legend>{p.sizes.length > 1 ? "Tamanhos e preços" : "Preço"}</legend>
          {p.sizes.map((s) => (
            <div className="row" key={s.id}>
              {p.sizes.length > 1 && <input className="grow" aria-label="Nome do tamanho" value={s.name} onChange={(e) => setSize(s.id, { name: e.target.value })} />}
              <PriceInput cents={s.price} label={`Preço de ${s.name}`} onChange={(price) => setSize(s.id, { price })} />
              {p.sizes.length > 1 && (
                <button type="button" className="icon-btn" aria-label={`Remover ${s.name}`} onClick={() => set({ sizes: p.sizes.filter((x) => x.id !== s.id) })}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="text-btn" onClick={() => set({ sizes: [...p.sizes, { id: newId(), name: "Novo tamanho", price: 0 }] })}>
            Adicionar outro tamanho
          </button>
        </fieldset>

        <label className="check">
          <input type="checkbox" checked={p.acceptsAddons} onChange={(e) => set({ acceptsAddons: e.target.checked })} />
          Aceita adicionais
        </label>
      </div>

      <footer className="sheet-foot">
        {!isNew && (
          <button type="button" className="danger" onClick={onDelete}>
            Apagar
          </button>
        )}
        <button className="primary grow" disabled={!valid} onClick={() => onSave({ ...p, name: p.name.trim() })}>
          {isNew ? "Adicionar ao cardápio" : "Salvar"}
        </button>
      </footer>
    </Sheet>
  );
}

function Resumo({ orders }: { orders: OrderRecord[] }) {
  const stats = useMemo(() => orderStats(orders, new Date()), [orders]);
  const recent = [...orders].reverse().slice(0, 20);
  const when = (at: number) => new Date(at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="stats">
        <div className="stat main">
          <span>Pedidos enviados ao WhatsApp</span>
          <b>{stats.total}</b>
        </div>
        <div className="stat">
          <span>Hoje</span>
          <b>{stats.today}</b>
        </div>
        <div className="stat">
          <span>Valor dos pedidos</span>
          <b>{money(stats.revenue)}</b>
        </div>
        <div className="stat">
          <span>Valor médio</span>
          <b>{money(stats.average)}</b>
        </div>
      </div>
      <p className="muted small">Cada pedido conta quando o cliente toca em Enviar pelo WhatsApp. O site não tem como saber se a mensagem foi mesmo enviada dentro do aplicativo.</p>

      <section className="panel">
        <h2>Últimos pedidos</h2>
        {recent.length === 0 ? (
          <p className="muted">Nenhum pedido ainda. Eles aparecem aqui assim que o cliente finaliza.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Quando</th>
                  <th>Cliente</th>
                  <th>Bairro</th>
                  <th>Pagamento</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.number}>
                    <td>
                      <b>#{o.number}</b>
                    </td>
                    <td>{when(o.at)}</td>
                    <td>{o.customer}</td>
                    <td>{o.district}</td>
                    <td>{o.payment}</td>
                    <td className="num">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export function Admin({ menu, settings, orders, onMenu, onSettings, onReset }: Props) {
  const [tab, setTab] = useState<Tab>("resumo");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  function save(next: Menu) {
    setError(onMenu(next) ? "" : "Não coube no armazenamento do navegador. Remova ou troque alguma foto.");
  }

  const close = () => setEditing(null);

  function saveProduct(p: Product) {
    const exists = menu.products.some((x) => x.id === p.id);
    save({ ...menu, products: exists ? menu.products.map((x) => (x.id === p.id ? p : x)) : [...menu.products, p] });
    close();
  }

  function setAddon(id: string, patch: Partial<Addon>) {
    save({ ...menu, addons: menu.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  }

  function newProduct() {
    setIsNew(true);
    setEditing({ id: newId(), categoryId: menu.categories[0].id, name: "", description: "", sizes: [{ id: "unico", name: "Único", price: 0 }], acceptsAddons: false, available: true });
  }

  const found = menu.products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <b>{settings.storeName}</b>
          <span>Painel da loja</span>
        </div>
        <nav aria-label="Seções do painel">
          {TABS.map((t) => (
            <button key={t.id} className={t.id === tab ? "on" : ""} aria-current={t.id === tab ? "page" : undefined} onClick={() => setTab(t.id)}>
              {t.name}
            </button>
          ))}
        </nav>
        <a className="admin-view" href="#/">
          Ver cardápio
        </a>
      </aside>

      <main className="admin-main">
        <p className="notice">Demonstração: o painel está sem senha, e os dados e pedidos ficam só neste navegador.</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {tab === "resumo" && (
          <>
            <h1>Resumo</h1>
            <Resumo orders={orders} />
          </>
        )}

        {tab === "produtos" && (
          <>
            <div className="admin-title">
              <h1>Produtos</h1>
              <button className="primary" onClick={newProduct}>
                Novo produto
              </button>
            </div>
            <input type="search" aria-label="Buscar produto" placeholder="Buscar produto" value={search} onChange={(e) => setSearch(e.target.value)} />
            {menu.categories.map((c) => {
              const items = found.filter((p) => p.categoryId === c.id);
              if (!items.length) return null;
              return (
                <section className="panel" key={c.id}>
                  <h2>{c.name}</h2>
                  <ul className="product-list">
                    {items.map((p) => (
                      <li key={p.id}>
                        <Photo src={p.photo} alt="" />
                        <div className="grow">
                          <b>{p.name}</b>
                          <small>{p.sizes.map((s) => money(s.price)).join(" / ")}</small>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={p.available}
                            aria-label={`${p.name} disponível`}
                            onChange={(e) => save({ ...menu, products: menu.products.map((x) => (x.id === p.id ? { ...x, available: e.target.checked } : x)) })}
                          />
                          <span>{p.available ? "Disponível" : "Esgotado"}</span>
                        </label>
                        <button
                          aria-label={`Editar ${p.name}`}
                          onClick={() => {
                            setIsNew(false);
                            setEditing(p);
                          }}
                        >
                          Editar
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            {found.length === 0 && <p className="muted">Nenhum produto encontrado.</p>}
          </>
        )}

        {tab === "adicionais" && (
          <>
            <div className="admin-title">
              <h1>Adicionais</h1>
              <button className="primary" onClick={() => save({ ...menu, addons: [...menu.addons, { id: newId(), name: "Novo adicional", price: 0 }] })}>
                Novo adicional
              </button>
            </div>
            <section className="panel">
              <p className="muted small">As mudanças são salvas sozinhas e valem para todos os produtos que aceitam adicionais.</p>
              {menu.addons.map((a) => (
                <div className="row addon-row" key={a.id}>
                  <input className="grow" aria-label="Nome do adicional" value={a.name} onChange={(e) => setAddon(a.id, { name: e.target.value })} />
                  <PriceInput cents={a.price} label={`Preço de ${a.name}`} onChange={(price) => setAddon(a.id, { price })} />
                  <button className="icon-btn" aria-label={`Remover ${a.name}`} onClick={() => save({ ...menu, addons: menu.addons.filter((x) => x.id !== a.id) })}>
                    ×
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {tab === "loja" && (
          <>
            <h1>Loja</h1>
            <section className="panel">
              <label className="field">
                <span>Nome da loja</span>
                <input value={settings.storeName} onChange={(e) => onSettings({ ...settings, storeName: e.target.value })} />
              </label>
              <label className="field">
                <span>WhatsApp que recebe os pedidos</span>
                <input inputMode="tel" placeholder="55 11 91234-5678" value={settings.whatsapp} onChange={(e) => onSettings({ ...settings, whatsapp: e.target.value })} />
                <small className="muted">Com DDI e DDD. Sem número, o WhatsApp pede para escolher o contato.</small>
              </label>
            </section>
            <button className="danger self-start" onClick={onReset}>
              Apagar alterações e pedidos
            </button>
          </>
        )}
      </main>

      {editing && (
        <ProductForm
          key={editing.id}
          menu={menu}
          product={editing}
          isNew={isNew}
          onSave={saveProduct}
          onCategory={(c) => save({ ...menu, categories: [...menu.categories, c] })}
          onClose={close}
          onDelete={() => {
            save({ ...menu, products: menu.products.filter((p) => p.id !== editing.id) });
            close();
          }}
        />
      )}
    </div>
  );
}
