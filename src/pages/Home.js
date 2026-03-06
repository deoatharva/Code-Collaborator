import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
export default function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // 🔥 Get logged-in user properly
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setCheckingSession(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔥 Fetch user rooms
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("owner_id", user.id);

    setMyRooms(data || []);
  };

  // 🔥 Create Room
  const createRoom = async () => {
    if (!user) {
      alert("You must be logged in");
      return;
    }

    setLoading(true);
    const id = uuidv4();

    try {
      // Create room
      const { error: roomError } = await supabase.from("rooms").insert({
        id,
        title: "New Room",
        owner_id: user.id,
      });

      if (roomError) throw roomError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("room_members")
        .insert({
          room_id: id,
          user_id: user.id,
          role: "editor",
        });

      if (memberError) throw memberError;

      // Create default file
      const { error: fileError } = await supabase.from("files").insert({
        room_id: id,
        name: "index.js",
        content: "// Start coding 🚀",
      });

      if (fileError) throw fileError;

      navigate(`/room/${id}`);
    } catch (error) {
      console.error("Error creating room:", error.message);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  // 🔥 Join Room
  const joinRoom = () => {
    if (!joinId) {
      alert("Enter Room ID");
      return;
    }

    navigate(`/room/${joinId}`);
  };

  if (checkingSession) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="card">
          <h1 className="title"><img src="logo300.png" width="25" ></img> Code Collab - Lets Start Coding !!!</h1>

          <p style={{ marginBottom: 20 }}>
            {user ? `Welcome ${user.email}` : "Please login first"}
          </p>

          <button
            className="button"
            onClick={createRoom}
            disabled={loading}
            style={{ marginBottom: 20 }}
          >
            {loading ? "Creating..." : "Create New Room"}
          </button>

          <hr style={{ margin: "20px 0" }} />

          <h3 style={{ marginBottom: 10 }}>Join Existing Room</h3>

          <input
            className="input"
            placeholder="Enter Room ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />

          <button className="button" onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>

      {/* 🔥 Your Projects */}
      {user && (
        <div className="projects-container">
          <h3>Your Projects</h3>

          {myRooms.length === 0 && <p>No projects yet.</p>}

          <div className="projects-grid">
            {myRooms.map((room) => (
              <ProjectCard
                key={room.id}
                room={room}
                navigate={navigate}
                fetchRooms={fetchRooms}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}