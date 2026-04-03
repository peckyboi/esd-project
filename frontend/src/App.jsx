import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GigDetailPage from "./pages/GigDetailPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import PaymentPage from "./pages/PaymentPage";
import AppTopBar from "@/components/AppTopBar";

function App() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
      <AppTopBar />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/gig/:gigId" element={<GigDetailPage />} />
        <Route path="/place-order/:gigId" element={<PlaceOrderPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}

export default App;
