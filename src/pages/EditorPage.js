import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import FileExplorer from "../components/FileExplorer";
import CodeEditor from "../components/CodeEditor";
import "../components/editor.css";

export default function EditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef();

  /* ================= FETCH FILES ================= */

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("room_id", id);

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    setFiles(data || []);
  };

  /* ================= LOAD + REALTIME ================= */

  useEffect(() => {
    if (!id) return;

    fetchFiles();

    const channel = supabase
      .channel("room-" + id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  /* ================= CLOSE DROPDOWN ================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ================= OPEN FILE ================= */

  const handleOpenFile = (file) => {
    const exists = openFiles.find((f) => f.id === file.id);

    if (!exists) {
      setOpenFiles((prev) => [...prev, file]);
    }

    setActiveFile(file);
  };

  /* ================= CLOSE TAB ================= */

  const closeTab = (fileId) => {
    const filtered = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(filtered);

    if (activeFile?.id === fileId) {
      setActiveFile(filtered.length > 0 ? filtered[0] : null);
    }
  };

  /* ================= SAVE ================= */

  const saveAll = async () => {
    if (!activeFile) return;

    const { error } = await supabase
      .from("files")
      .update({ content: activeFile.content })
      .eq("id", activeFile.id);

    if (error) {
      console.error("Save error:", error);
      return;
    }

    alert("Saved!");
  };

  /* ================= COPY ROOM ================= */

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="editor-page">

      {/* TOPBAR */}
      <div className="topbar">
        <h2>💻 CodeCollab</h2>

        <div className="topbar-right">
          <button className="btn btn-primary" onClick={saveAll}>
            💾 Save
          </button>

          <div className="user-menu" ref={menuRef}>
            <button
              className="icon-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              👤
            </button>

            {showMenu && (
              <div className="dropdown">
                <div onClick={() => navigate("/")}>
                  🏠 Dashboard
                </div>
                <div onClick={copyRoomCode}>
                  📋 Copy Room Code
                </div>
                <div onClick={logout}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {copied && (
        <div className="copied-toast">
          Room Code Copied!
        </div>
      )}

      {/* MAIN */}
      <div className="editor-layout">
        <FileExplorer
          files={files}
          roomId={id}   // 🔥 ADD THIS
          setActiveFile={handleOpenFile}
        />

        <div className="editor-area">

          {/* TABS */}
          <div className="tabs">
            {openFiles.map((file) => (
              <div
                key={file.id}
                className={`tab ${
                  activeFile?.id === file.id ? "active" : ""
                }`}
                onClick={() => setActiveFile(file)}
              >
                {file.name}
                <span
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(file.id);
                  }}
                >
                  ✖
                </span>
              </div>
            ))}
          </div>

          {/* EDITOR */}
          {activeFile ? (
            <CodeEditor
              file={activeFile}
              setFile={(updatedFile) => {
                setActiveFile(updatedFile);

                setOpenFiles((prev) =>
                  prev.map((f) =>
                    f.id === updatedFile.id ? updatedFile : f
                  )
                );
              }}
            />
          ) : (
            <div style={{ padding: 20 }}>
              No file opened
            </div>
          )}
        </div>
      </div>
    </div>
  );
}