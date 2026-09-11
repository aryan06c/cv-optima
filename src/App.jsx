import { useEffect, useRef, useState, useMemo } from "react";
import Header from "./components/Header";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Skills from "./components/Skills";

const PRINTABLE_HEIGHT_PX = 960;

// Dynamically import all resumes in the folder
const resumeModules = import.meta.glob('./data/resumes/*.js', { eager: true });

export default function App() {
  const contentRef = useRef(null);

  // File-based versions
  const fileVersions = useMemo(() => {
    const versions = {};
    for (const path in resumeModules) {
      // Extract filename without extension as ID
      const id = path.split('/').pop().replace('.js', '');
      const mod = resumeModules[path];
      if (mod.data) {
        versions[id] = { name: mod.name || id, data: mod.data, isFileBased: true };
      }
    }
    return versions;
  }, []);

  // UI-created versions from localStorage
  const [localVersions, setLocalVersions] = useState(() => {
    const saved = localStorage.getItem("resumeLocalVersions");
    return saved ? JSON.parse(saved) : {};
  });

  // Hidden file-based versions from localStorage
  const [hiddenVersions, setHiddenVersions] = useState(() => {
    const saved = localStorage.getItem("resumeHiddenVersions");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentVersionId, setCurrentVersionId] = useState(() => {
    const defaultId = Object.keys(fileVersions)[0] || "";
    return localStorage.getItem("resumeCurrentVersion") || defaultId;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionData, setNewVersionData] = useState("");
  const [parseError, setParseError] = useState("");
  const [useSameHeader, setUseSameHeader] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("resumeLocalVersions", JSON.stringify(localVersions));
  }, [localVersions]);

  useEffect(() => {
    localStorage.setItem("resumeHiddenVersions", JSON.stringify(hiddenVersions));
  }, [hiddenVersions]);

  useEffect(() => {
    localStorage.setItem("resumeCurrentVersion", currentVersionId);
  }, [currentVersionId]);

  useEffect(() => {
    const handleBeforePrint = () => {
      const el = contentRef.current;
      if (!el) return;
      el.style.zoom = 1;
      const contentHeight = el.scrollHeight;
      if (contentHeight > PRINTABLE_HEIGHT_PX) {
        el.style.zoom = PRINTABLE_HEIGHT_PX / contentHeight;
      }
    };
    const handleAfterPrint = () => {
      if (contentRef.current) contentRef.current.style.zoom = 1;
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  // Combine and filter active versions
  const activeVersions = useMemo(() => {
    const combined = { ...fileVersions, ...localVersions };
    const filtered = {};
    for (const key in combined) {
      if (!hiddenVersions.includes(key)) {
        filtered[key] = combined[key];
      }
    }
    return filtered;
  }, [fileVersions, localVersions, hiddenVersions]);

  // Ensure currentVersionId is valid, fallback if not
  const currentData = activeVersions[currentVersionId]?.data ||
    Object.values(activeVersions)[0]?.data;

  // Fallback if no resumes exist at all
  if (!currentData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>No resumes found. Please create one.</div>;
  }

  const handleOpenEditModal = () => {
    const currentVersion = activeVersions[currentVersionId];
    if (!currentVersion) return;

    setIsEditMode(true);
    setNewVersionName(currentVersion.name);
    
    // Create a copy of data without header for editing, including "title"
    const { header, ...dataWithoutHeader } = currentVersion.data;
    const dataWithTitle = {
      title: currentVersion.name,
      ...dataWithoutHeader
    };
    setNewVersionData(JSON.stringify(dataWithTitle, null, 2));
    setUseSameHeader(true); // Always default to true when editing
    setParseError("");
    setIsModalOpen(true);
  };

  const handleVersionDataChange = (val) => {
    setNewVersionData(val);
    try {
      let cleanString = val.trim();
      let parsed;
      if (cleanString.startsWith("{")) {
        parsed = JSON.parse(cleanString);
      } else {
        parsed = new Function("return " + cleanString)();
      }
      if (parsed && parsed.title && typeof parsed.title === "string") {
        setNewVersionName(parsed.title);
      }
    } catch (e) {
      // Silently ignore parsing errors while typing
    }
  };

  const handleAddNewVersion = () => {
    try {
      let parsedData;
      let cleanString = newVersionData.trim();

      try {
        parsedData = JSON.parse(cleanString);
      } catch (e) {
        if (cleanString.startsWith("const") || cleanString.startsWith("let") || cleanString.startsWith("export")) {
          throw new Error("Please paste a plain JS Object or JSON, not variable declarations.");
        }
        parsedData = new Function("return " + cleanString)();
      }

      const finalVersionName = newVersionName.trim() || parsedData.title || "Untitled";

      if (useSameHeader) {
        parsedData.header = activeVersions['default']?.data?.header || fileVersions['default']?.data?.header;
      }

      if (!parsedData || typeof parsedData !== "object" || !parsedData.header) {
        throw new Error("Invalid data format. Ensure it contains header, experience, etc.");
      }

      if (isEditMode) {
        // Update existing version
        const id = currentVersionId;
        setLocalVersions(prev => ({
          ...prev,
          [id]: { name: finalVersionName, data: parsedData, isFileBased: false }
        }));
      } else {
        // Create new version
        const id = finalVersionName.toLowerCase().replace(/[^a-z0-9]/g, "") || Date.now().toString();
        setLocalVersions(prev => ({
          ...prev,
          [id]: { name: finalVersionName, data: parsedData, isFileBased: false }
        }));
        setCurrentVersionId(id);
      }
      
      setIsModalOpen(false);
      setNewVersionName("");
      setNewVersionData("");
      setParseError("");
      setUseSameHeader(true);
      setIsEditMode(false);
    } catch (err) {
      setParseError(err.message || "Failed to parse data.");
    }
  };

  const handleDelete = () => {
    if (currentVersionId === 'default') return; // Should not reach here because button is hidden

    const isFileBased = activeVersions[currentVersionId]?.isFileBased;
    if (isFileBased) {
      setHiddenVersions(prev => [...prev, currentVersionId]);
    } else {
      setLocalVersions(prev => {
        const copy = { ...prev };
        delete copy[currentVersionId];
        return copy;
      });
    }

    // Switch to another active version after deletion
    const remainingKeys = Object.keys(activeVersions).filter(k => k !== currentVersionId);
    if (remainingKeys.length > 0) {
      setCurrentVersionId(remainingKeys[0]);
    }
  };

  return (
    <>
      <div className="download-bar">
        <select
          value={currentVersionId}
          onChange={(e) => setCurrentVersionId(e.target.value)}
        >
          {Object.keys(activeVersions).map(key => (
            <option key={key} value={key}>{activeVersions[key].name}</option>
          ))}
        </select>
        {currentVersionId !== 'default' && (
          <>
            <button onClick={handleOpenEditModal} className="btn-edit" title="Edit Version">
              <i className="fas fa-edit"></i>
            </button>
            <button onClick={handleDelete} className="btn-delete" title="Delete Version">
              <i className="fas fa-trash"></i>
            </button>
          </>
        )}
        <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="btn-new">
          + New
        </button>
        <button onClick={() => window.print()}>
          <i className="fas fa-download"></i>&nbsp; Download PDF
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '600px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ color: '#333' }}>{isEditMode ? 'Edit Version' : 'Create New Version'}</h2>
            <input
              placeholder="Version Name (e.g., Apple SWE)"
              value={newVersionName}
              onChange={e => setNewVersionName(e.target.value)}
              style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useSameHeader}
                onChange={(e) => setUseSameHeader(e.target.checked)}
              />
              Use Default Header
            </label>

            <p style={{ fontSize: '12px', color: '#666', marginBottom: '-5px' }}>
              Paste your customized resume data object below (JSON or valid JS object notation).
            </p>
            <textarea
              placeholder={useSameHeader ? '{\n  "title": "Company-Role-Date",\n  "experience": [ ... ],\n  "projects": [ ... ],\n  "education": [ ... ],\n  "skills": [ ... ]\n}' : '{\n  "title": "Company-Role-Date",\n  "header": { ... },\n  "experience": [ ... ],\n  "projects": [ ... ],\n  "education": [ ... ],\n  "skills": [ ... ]\n}'}
              value={newVersionData}
              onChange={e => handleVersionDataChange(e.target.value)}
              style={{ height: '260px', padding: '10px', fontFamily: 'monospace', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {parseError && <div style={{ color: 'red', fontSize: '13px' }}>{parseError}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={handleAddNewVersion} style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="page">
        <div className="page-inner" ref={contentRef}>
          <Header data={currentData.header} />
          <Experience data={currentData.experience} />
          <Projects data={currentData.projects} />
          <Education data={currentData.education} />
          <Skills data={currentData.skills} />
        </div>
      </div>
    </>
  );
}
