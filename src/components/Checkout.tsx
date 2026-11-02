import { FormEvent, useState } from "react";
import { money } from "../lib/money";
import { cartTotal, ResolvedLine } from "../lib/order";
import type { Delivery, Payment } from "../types";

const PAYMENTS: Payment[] = ["Pix", "Cartão na entrega", "Dinheiro"];

type Props = { lines: ResolvedLine[]; onSend: (delivery: Delivery) => void; onBack: () => void };

export function Checkout({ lines, onSend, onBack }: Props) {
  const [d, setD] = useState<Delivery>({ name: "", address: "", district: "", complement: "", payment: "Pix", change: "" });
  const set = (patch: Partial<Delivery>) => setD((old) => ({ ...old, ...patch }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSend(d);
  }

  return (
    <form onSubmit={submit}>
      <div className="sheet-body">
        <label className="field">
          <span>Seu nome</span>
          <input required autoComplete="name" value={d.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="field">
          <span>Rua e número</span>
          <input required autoComplete="street-address" value={d.address} onChange={(e) => set({ address: e.target.value })} />
        </label>
        <label className="field">
          <span>Bairro</span>
          <input required value={d.district} onChange={(e) => set({ district: e.target.value })} />
        </label>
        <label className="field">
          <span>Complemento ou referência (opcional)</span>
          <input value={d.complement} onChange={(e) => set({ complement: e.target.value })} />
        </label>

        <fieldset className="choices">
          <legend>Forma de pagamento</legend>
          {PAYMENTS.map((p) => (
            <label key={p} className={p === d.payment ? "choice on" : "choice"}>
              <input type="radio" name="payment" checked={p === d.payment} onChange={() => set({ payment: p })} />
              <span>{p}</span>
            </label>
          ))}
        </fieldset>
        {d.payment === "Dinheiro" && (
          <label className="field">
            <span>Troco para quanto? (opcional)</span>
            <input inputMode="decimal" value={d.change} onChange={(e) => set({ change: e.target.value })} />
          </label>
        )}
        <p className="muted small">O pagamento é combinado pelo WhatsApp ou na entrega.</p>
      </div>

      <footer className="sheet-foot">
        <button type="button" onClick={onBack}>
          Voltar
        </button>
        <button className="primary grow whatsapp">Enviar pelo WhatsApp · {money(cartTotal(lines))}</button>
      </footer>
    </form>
  );
}
