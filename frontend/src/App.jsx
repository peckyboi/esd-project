import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GigDetailPage from "./pages/GigDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/gig/:id" element={<GigDetailPage />} />
    </Routes>
  );
}

export default App;
