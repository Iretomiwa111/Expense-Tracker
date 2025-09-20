import { useState, useEffect } from "react";
import App from "./App";
import Auth from "./components/Auth";

function AppWrapper() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ email: "user@example.com" }); 
    }
  }, []);

  if (!user) {
    return <Auth setUser={setUser} />; 
  }

  return <App user={user} setUser={setUser} />;
}

export default AppWrapper;
