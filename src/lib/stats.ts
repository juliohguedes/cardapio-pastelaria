import type { OrderRecord } from "../types";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function orderStats(orders: OrderRecord[], now: Date) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  return {
    total: orders.length,
    today: orders.filter((o) => sameDay(new Date(o.at), now)).length,
    revenue,
    average: orders.length ? Math.round(revenue / orders.length) : 0,
  };
}
