// ---------- HEADING ----------
export default function Header({ data }) {
  const { name, contacts } = data;
  return (
    <div className="heading">
      <h1>{name}</h1>
      <div className="contact">
        {contacts.map((c, i) => (
          <span key={i}>
            <i className={c.icon}></i>&nbsp;
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer">
                {c.text}
              </a>
            ) : (
              c.text
            )}
            {i < contacts.length - 1 && <span className="sep">|</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
