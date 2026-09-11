// Section wrapper — title with the 2pt light-grey rule (LaTeX \titlerule)
export default function Section({ title, children }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
