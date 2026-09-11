// Two-row entry heading — LaTeX \resumeSubheading
// Row 1: bold title ......... date (dark-grey, small)
// Row 2: italic subtitle .... detail (dark-grey, small)
export default function EntryHeading({ title, date, subtitle, detail }) {
  return (
    <>
      <div className="row first">
        <span className="left title-bold">{title}</span>
        <span className="right">{date}</span>
      </div>
      {(subtitle || detail) && (
        <div className="row">
          <span className="left title-italic">{subtitle}</span>
          <span className="right">{detail}</span>
        </div>
      )}
    </>
  );
}
