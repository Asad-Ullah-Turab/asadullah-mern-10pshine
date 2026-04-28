import { Route, Routes } from "react-router";
import Login from "./pages/auth/Login";
import NotFound from "./pages/notfound/NotFound";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/Signup";
import { useEffect, useState } from "react";
import UserContext from "./store/UserContext";
import { GetLoggedInUser } from "./api/auth";

function App() {
  const [user, setUser] = useState(null);
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
      if (user.error) {
        setUser(null);
        setLoading(false);
        console.log("Error fetching user: ", user.error);
        return;
      }
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, isAuthenticated }}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
