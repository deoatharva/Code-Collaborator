import { supabase } from "../supabase";
import "./navbar.css";

export default function Navbar() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="navbar">
      <h3 className="logo"><img src="logo300.png" width="18" ></img>  CodeCollab</h3>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}