import { Route, Routes } from "react-router";
import Login from "./pages/auth/Login";
import NotFound from "./pages/notfound/NotFound";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/Signup";

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
