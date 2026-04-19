export default function TableCard({ title, subtitle, children }) {
  return (
    <section className="table-card pin-card">
      <header className="section-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div className="table-wrap">{children}</div>
    </section>
  );
}
