import { Route, Routes } from "react-router";
import Login from "./pages/auth/Login";
import NotFound from "./pages/notfound/NotFound";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/Signup";
import { useEffect, useState } from "react";
import UserContext from "./store/UserContext";
import { GetLoggedInUser } from "./api/auth";
import Profile from "./pages/profile/Profile";
import type { IUser } from "./types/User";

function App() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = () => {
    if (user == null) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await GetLoggedInUser();
      if (!user || user.error) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, isAuthenticated, setUser }}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
