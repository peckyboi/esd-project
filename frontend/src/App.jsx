import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GigDetailPage from "./pages/GigDetailPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import PaymentPage from "./pages/PaymentPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/gig/:id" element={<GigDetailPage />} />
      <Route path="/place-order" element={<PlaceOrderPage />} />
      <Route path="/payment" element={<PaymentPage />} />
    </Routes>
  );
}

export default App;
