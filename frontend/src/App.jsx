import { Routes, Route, Navigate } from "react-router-dom";
import OrdersPage from "./pages/OrdersPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import GigDetailPage from "./pages/GigDetailPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import PaymentPage from "./pages/PaymentPage";
import AppTopBar from "@/components/AppTopBar";
import AppSidebar from "@/components/AppSidebar";
import { useActor } from "@/context/actorContext";

function App() {

  const { resolvedUserId, role } = useActor();

  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
      <AppTopBar />

      <div className="flex min-h-[calc(100vh-73px)]">
        <AppSidebar />

        <div className="min-w-0 flex-1">
          <Routes>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={ <ChatPage 
            currentUserId={resolvedUserId} currentUserRole={role} />} />
            <Route path="/gig/:gigId" element={<GigDetailPage />} />
            <Route path="/place-order/:gigId" element={<PlaceOrderPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;