import { money } from "../lib/money";
import { cartTotal, ResolvedLine } from "../lib/order";

type Props = {
  lines: ResolvedLine[];
  onQty: (id: string, qty: number) => void;
  onCheckout: () => void;
};

export function Cart({ lines, onQty, onCheckout }: Props) {
  if (!lines.length) return <p className="cart-empty">Seu carrinho está vazio. Escolha um pastel para começar.</p>;

  return (
    <>
      <ul className="cart-list">
        {lines.map((l) => (
          <li key={l.line.id}>
            <div className="cart-text">
              <b>{l.product.name}</b>
              <small>
                {[l.product.sizes.length > 1 ? l.size.name : "", ...l.addons.map((a) => `+ ${a.name}`)].filter(Boolean).join(" · ")}
              </small>
              <span>{money(l.total)}</span>
            </div>
            <div className="stepper small" role="group" aria-label={`Quantidade de ${l.product.name}`}>
              <button onClick={() => onQty(l.line.id, l.line.qty - 1)} aria-label={l.line.qty === 1 ? "Remover" : "Diminuir"}>
                −
              </button>
              <output>{l.line.qty}</output>
              <button onClick={() => onQty(l.line.id, l.line.qty + 1)} aria-label="Aumentar">
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <span>Total</span>
        <b>{money(cartTotal(lines))}</b>
      </div>
      <button className="primary wide" onClick={onCheckout}>
        Finalizar pedido
      </button>
    </>
  );
}
