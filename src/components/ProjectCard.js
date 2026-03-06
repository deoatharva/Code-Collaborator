import { useState } from "react";
import { supabase } from "../supabase";
import "./project.css";

export default function ProjectCard({ room, navigate, fetchRooms }) {
  const [showMenu, setShowMenu] = useState(false);

  const renameRoom = async () => {
    const newName = prompt("Enter new project name", room.title);
    if (!newName) return;

    await supabase
      .from("rooms")
      .update({ title: newName })
      .eq("id", room.id);

    fetchRooms();
  };

  const deleteRoom = async () => {
    const confirmDelete = window.confirm("Delete this project?");
    if (!confirmDelete) return;

    await supabase.from("rooms").delete().eq("id", room.id);
    fetchRooms();
  };

  return (
  <div
    className="project-card"
    onMouseLeave={() => setShowMenu(false)}
  >
    <div className="project-header">
      <div
        className="project-title"
        onClick={() => navigate(`/room/${room.id}`)}
      >
        {room.title}
      </div>

      <div className="menu-wrapper">
        <button
          className="menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋯
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <div onClick={renameRoom}>✏ Rename</div>
            <div onClick={deleteRoom}>🗑 Delete</div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}