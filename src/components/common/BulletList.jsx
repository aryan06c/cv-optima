import RichText from "./RichText";

// Bullet list — LaTeX \resumeItemListStart ... \resumeItemListEnd
export default function BulletList({ items }) {
  return (
    <ul className="items">
      {items.map((item, i) => (
        <li key={i}>
          <RichText text={item} />
        </li>
      ))}
    </ul>
  );
}
