export default function TableCard({ title, children }) {
  return (
    <section className="table-card">
      <h3>{title}</h3>
      <div className="table-wrap">{children}</div>
    </section>
  );
}
