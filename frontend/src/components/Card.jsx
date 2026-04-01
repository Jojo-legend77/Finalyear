export default function Card({ title, children, actions, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <h3>{title}</h3>
          <div>{actions}</div>
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
