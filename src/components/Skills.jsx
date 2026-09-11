import Section from "./common/Section";

// ---------- SKILLS ----------
export default function Skills({ data }) {
  return (
    <Section title="SKILLS">
      <div className="skills">
        {data.map((s, i) => (
          <p key={i}>
            <b>{s.label}</b>: {s.value}
          </p>
        ))}
      </div>
    </Section>
  );
}
