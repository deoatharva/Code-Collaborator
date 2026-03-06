import { useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "../supabase";
import "./editor.css";

export default function FileExplorer({ files, roomId, setActiveFile }) {
  const [openFolders, setOpenFolders] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const scrollRef = useRef();

  //const roomId = files[0]?.room_id;

  const buildTree = (list, parentId = null) => {
    return list
      .filter((item) => item.parent_id === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(list, item.id),
      }));
  };

  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ================= ROOT CREATE ================= */

  const createRootFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name || !roomId) return;

    const { error } = await supabase.from("files").insert([
      {
        name,
        type: "folder",
        parent_id: null,
        room_id: roomId,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error creating folder");
    }
  };

  const createRootFile = async () => {
    const name = prompt("Enter file name:");
    if (!name || !roomId) return;

    const { error } = await supabase.from("files").insert([
      {
        name,
        type: "file",
        content: "",
        parent_id: null,
        room_id: roomId,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error creating file");
    }
  };

  /* ================= CREATE FILE ================= */

  const createFile = async (parentId) => {
    const name = prompt("Enter file name:");
    if (!name) return;

    const { error } = await supabase.from("files").insert([
      {
        name,
        type: "file",
        content: "",
        parent_id: parentId,
        room_id: roomId,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error creating file");
    }
  };

  /* ================= CREATE FOLDER ================= */

  const createFolder = async (parentId) => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    const { error } = await supabase.from("files").insert([
      {
        name,
        type: "folder",
        parent_id: parentId,
        room_id: roomId,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error creating folder");
    }
  };

  /* ================= DELETE ================= */

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    const { error } = await supabase.from("files").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Error deleting");
    }
  };

  /* ================= RENAME ================= */

  const renameItem = async (node) => {
    const newName = prompt("Enter new name:", node.name);
    if (!newName) return;

    const { error } = await supabase
      .from("files")
      .update({ name: newName })
      .eq("id", node.id);

    if (error) {
      console.error(error);
      alert("Error renaming");
    }
  };

  /* ================= DOWNLOAD ================= */

  const downloadAllFiles = async () => {
    const zip = new JSZip();

    const addFilesToZip = (parentId = null, path = "") => {
      files
        .filter((item) => item.parent_id === parentId)
        .forEach((item) => {
          if (item.type === "folder") {
            addFilesToZip(item.id, `${path}${item.name}/`);
          } else {
            zip.file(`${path}${item.name}`, item.content || "");
          }
        });
    };

    addFilesToZip();

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "project.zip");
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isOpen = openFolders[node.id];
      const isMenuOpen = activeMenu === node.id;

      return (
        <div key={node.id}>
          <div
            className={`file-item level-${level} ${
              node.type === "folder" && isOpen ? "folder-open" : ""
            }`}
          >
            <div
              className="file-left"
              onClick={() => {
                if (node.type === "folder") {
                  toggleFolder(node.id);
                } else {
                  setActiveFile(node);
                }
              }}
            >
              {node.type === "folder" && (
                <span className="folder-arrow">▶</span>
              )}

              <span className="file-icon">
                {node.type === "folder"
                  ? isOpen
                    ? "📂"
                    : "📁"
                  : "📄"}
              </span>

              <span className="file-name">{node.name}</span>
            </div>

            <div
              className="file-menu"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(isMenuOpen ? null : node.id);
              }}
            >
              ⋯

              {isMenuOpen && (
                <div className="dropdown">
                  <div onClick={() => renameItem(node)}>Rename</div>
                  <div onClick={() => deleteItem(node.id)}>Delete</div>

                  {node.type === "folder" && (
                    <>
                      <div onClick={() => createFile(node.id)}>
                        New File
                      </div>
                      <div onClick={() => createFolder(node.id)}>
                        New Folder
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {node.type === "folder" &&
            isOpen &&
            node.children.length > 0 &&
            renderTree(node.children, level + 1)}
        </div>
      );
    });
  };

  const treeData = buildTree(files || []);

  return (
    <div className="sidebar">
      
      {/* 🔥 ROOT BUTTONS */}
      <div className="root-actions">
        <button onClick={createRootFolder}>📁 New Folder</button>
        <button onClick={createRootFile}>📄 New File</button>
      </div>

      <div className="sidebar-files" ref={scrollRef}>
        {renderTree(treeData)}
      </div>

      <div className="sidebar-footer">
        <button
          className="btn btn-secondary"
          onClick={downloadAllFiles}
        >
          ⬇ Download Project
        </button>
      </div>
    </div>
  );
}