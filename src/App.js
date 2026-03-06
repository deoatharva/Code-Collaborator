import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import Login from "./auth/Login";
import Register from "./auth/Register";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={session ? <Home /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/room/:id"
        element={session ? <EditorPage /> : <Login />}
      />
    </Routes>
  );
}

export default App;