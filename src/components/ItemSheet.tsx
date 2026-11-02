import { useState } from "react";
import { money } from "../lib/money";
import type { Addon, CartLine, Product } from "../types";
import { Photo } from "./Photo";
import { Sheet } from "./Sheet";

type Props = {
  product: Product;
  addons: Addon[];
  onAdd: (item: Omit<CartLine, "id">) => void;
  onClose: () => void;
};

export function ItemSheet({ product, addons, onAdd, onClose }: Props) {
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const extras = addons.filter((a) => addonIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const total = (size.price + extras) * qty;

  const toggle = (id: string) => setAddonIds((list) => (list.includes(id) ? list.filter((a) => a !== id) : [...list, id]));

  return (
    <Sheet title={product.name} onClose={onClose}>
      <div className="sheet-body">
        <div className="sheet-photo">
          <Photo src={product.photo} alt={product.name} />
        </div>
        <p className="muted">{product.description}</p>

        {product.sizes.length > 1 && (
          <fieldset className="choices">
            <legend>Tamanho</legend>
            {product.sizes.map((s) => (
              <label key={s.id} className={s.id === sizeId ? "choice on" : "choice"}>
                <input type="radio" name="size" checked={s.id === sizeId} onChange={() => setSizeId(s.id)} />
                <span>{s.name}</span>
                <b>{money(s.price)}</b>
              </label>
            ))}
          </fieldset>
        )}

        {product.acceptsAddons && addons.length > 0 && (
          <fieldset className="choices">
            <legend>Adicionais</legend>
            {addons.map((a) => (
              <label key={a.id} className={addonIds.includes(a.id) ? "choice on" : "choice"}>
                <input type="checkbox" checked={addonIds.includes(a.id)} onChange={() => toggle(a.id)} />
                <span>{a.name}</span>
                <b>+ {money(a.price)}</b>
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <footer className="sheet-foot">
        <div className="stepper" role="group" aria-label="Quantidade">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1} aria-label="Diminuir">
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar">
            +
          </button>
        </div>
        <button
          className="primary grow"
          onClick={() => {
            onAdd({ productId: product.id, sizeId: size.id, addonIds, qty });
            onClose();
          }}
        >
          Adicionar · {money(total)}
        </button>
      </footer>
    </Sheet>
  );
}
