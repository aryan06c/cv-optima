import Section from "./common/Section";
import BulletList from "./common/BulletList";

// ---------- PROJECTS ----------
export default function Projects({ data }) {
  return (
    <Section title="PROJECTS">
      {data.map((project, i) => (
        <div className="entry" key={i}>
          <div className="row first">
            <span className="left title-bold">{project.name}</span>
            <span className="right"></span>
          </div>
          <BulletList items={project.bullets} />
        </div>
      ))}
    </Section>
  );
}
