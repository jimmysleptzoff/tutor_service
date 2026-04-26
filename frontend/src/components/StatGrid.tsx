import type { Metric } from "../types/scheduling";

type StatGridProps = {
  items: Metric[];
};

export default function StatGrid({ items }: StatGridProps) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <h3>{item.value}</h3>
          <p>{item.label}</p>
        </article>
      ))}
    </div>
  );
}
