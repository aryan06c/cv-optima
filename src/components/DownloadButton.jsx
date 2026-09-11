// ---------- DOWNLOAD PDF BUTTON ----------
// window.print() -> "Save as PDF". Single-page fitting is handled
// in App.jsx via the beforeprint auto-scale hook.
export default function DownloadButton() {
  return (
    <div className="download-bar">
      <button onClick={() => window.print()}>
        <i className="fas fa-download"></i>&nbsp; Download PDF
      </button>
    </div>
  );
}
