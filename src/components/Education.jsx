import Section from "./common/Section";
import EntryHeading from "./common/EntryHeading";

// ---------- EDUCATION ----------
export default function Education({ data }) {
  return (
    <Section title="EDUCATION">
      {data.map((edu, i) => (
        <div className="entry" key={i}>
          <EntryHeading
            title={edu.school}
            date={edu.date}
            subtitle={edu.degree}
            detail={edu.detail}
          />
        </div>
      ))}
    </Section>
  );
}
