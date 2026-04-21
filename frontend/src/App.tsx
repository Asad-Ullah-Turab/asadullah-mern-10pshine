import { Route, Routes } from "react-router";
import Login from "./pages/login/Login";
import NotFound from "./pages/notfound/NotFound";
import Home from "./pages/home/Home";

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
