import Section from "./common/Section";
import EntryHeading from "./common/EntryHeading";
import BulletList from "./common/BulletList";

// ---------- EXPERIENCE ----------
export default function Experience({ data }) {
  return (
    <Section title="EXPERIENCE">
      {data.map((job, i) => (
        <div className="entry" key={i}>
          <EntryHeading
            title={job.company}
            date={job.date}
            subtitle={job.role}
            detail={job.location}
          />
          <BulletList items={job.bullets} />
        </div>
      ))}
    </Section>
  );
}
